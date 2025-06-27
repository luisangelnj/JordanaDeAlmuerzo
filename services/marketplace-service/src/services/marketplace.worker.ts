import { connect } from 'amqplib';
import axios from 'axios';

const MARKET_API_URL = process.env.ALEGRA_EXTERNAL_MARKETPLACE_API || '';
const MAIN_EXCHANGE = 'marketplace_exchange';
const PURCHASE_QUEUE = 'marketplace_purchase_queue';
const CONFIRMATION_QUEUE = 'purchase_confirmation_queue';

const WAIT_EXCHANGE = 'marketplace_wait_exchange';
const WAIT_QUEUE = 'marketplace_wait_queue';
const RETRY_DELAY_MS = 2000; // 2 segundos

interface IngredientToPurchase {
    name: string;
    quantity: number;
}

async function purchaseIngredient(ingredient: IngredientToPurchase): Promise<{ name: string; quantityBought: number } | null> {
    let totalQuantityBought = 0;
    const quantityNeeded = ingredient.quantity;

    console.log(` -> Aggressive purchase started for ${quantityNeeded} of ${ingredient.name}.`);

    // Inicia un bucle que no se detendrá hasta tener la cantidad necesaria
    while (totalQuantityBought < quantityNeeded) {
        try {
            const response = await axios.get(`${MARKET_API_URL}?ingredient=${ingredient.name}`);
            const quantitySold = response.data.quantitySold;

            if (quantitySold > 0) {
                totalQuantityBought += quantitySold;
                console.log(`    [+] Bought ${quantitySold}, total so far: ${totalQuantityBought}/${quantityNeeded} of ${ingredient.name}`);
            } else {
                // Si no hay stock, espera un poco antes de volver a intentarlo para no saturar la API
                console.log(`    [+] No stock for ${ingredient.name}, retrying...`);
                await new Promise(resolve => setTimeout(resolve, 500)); // Espera 0.5 segundos
            }
        } catch (error) {
            console.error(`    [!] API error for ${ingredient.name}, retrying...`, error);
            // Espera un poco más si hay un error de red/servidor
            await new Promise(resolve => setTimeout(resolve, 2000)); // Espera 2 segundos
        }
    }
    
    console.log(`    [v] Aggressive purchase complete for ${ingredient.name}. Total bought: ${totalQuantityBought}.`);
    // Devuelve el nombre y la cantidad total que se logró comprar (que podría ser un poco más de lo necesario)
    return { name: ingredient.name, quantityBought: totalQuantityBought };
}

export const startMarketplaceWorker = async () => {
    try {
        const connection = await connect(process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672');
        const channel = await connection.createChannel();

        // 1. Asegurar que los exchanges existan
        await channel.assertExchange(MAIN_EXCHANGE, 'direct', { durable: true });
        await channel.assertExchange(WAIT_EXCHANGE, 'direct', { durable: true });

        // 2. Configurar la cola principal de compras
        await channel.assertQueue(PURCHASE_QUEUE, { durable: true });
        await channel.bindQueue(PURCHASE_QUEUE, MAIN_EXCHANGE, 'purchase_key');

        // 3. Configurar la cola de espera con TTL y Dead-Lettering
        await channel.assertQueue(WAIT_QUEUE, {
            durable: true,
            arguments: {
                'x-message-ttl': RETRY_DELAY_MS, // Tiempo de vida del mensaje
                'x-dead-letter-exchange': MAIN_EXCHANGE, // A dónde va cuando muere
                'x-dead-letter-routing-key': 'purchase_key' // Qué routing key usa
            }
        });
        await channel.bindQueue(WAIT_QUEUE, WAIT_EXCHANGE, 'wait_key');

        await channel.prefetch(1);

        console.log(`[*] Marketplace waiting for purchase requests in ${PURCHASE_QUEUE}.`);

        channel.consume(PURCHASE_QUEUE, async (msg) => {
            if (msg !== null) {
                try {
                    const { batchId, ingredients } = JSON.parse(msg.content.toString());
                    console.log(`[x] Received purchase request for batch ${batchId}.`);
                    
                    const successfulPurchases = [];

                    // --- Se reemplaza Promise.all con bucle secuencial ---
                    // Procesamos un ingrediente a la vez para no saturar la API externa.
                    for (const ingredient of ingredients) {
                        const result = await purchaseIngredient(ingredient);
                        if (result) {
                            successfulPurchases.push(result);
                        }
                        //Pausa entre la compra de diferentes tipos de ingredientes.
                        await new Promise(resolve => setTimeout(resolve, 200)); // 200ms de pausa
                    }

                    if (successfulPurchases.length > 0) {
                        const confirmationMessage = { batchId, purchasedIngredients: successfulPurchases };
                        // Publicamos la confirmación directamente a la cola de confirmación
                        channel.sendToQueue(CONFIRMATION_QUEUE, Buffer.from(JSON.stringify(confirmationMessage)));
                        console.log(`[>] Sent purchase confirmation for batch ${batchId} to ${CONFIRMATION_QUEUE}.`);
                    } else {
                        
                        console.log(`[!] No ingredients purchased for ${batchId}. Sending to wait queue for retry in ${RETRY_DELAY_MS/1000} seconds...`);
                        // En lugar de fallar, envía el mensaje a la cola de espera. (Reintentamos hacer la compra)
                        channel.publish(WAIT_EXCHANGE, 'wait_key', msg.content);
                    }

                    channel.ack(msg); // Confirma el mensaje original, ya que fue manejado (enviado a confirmación o a espera)
                } catch (error) {
                    console.error("Error processing purchase request:", error);
                    channel.nack(msg, false, false);
                }
            }
        });
    } catch (error) {
        console.error('Failed to start Marketplace worker:', error);
    }
};