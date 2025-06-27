import { connect } from 'amqplib';
import axios from 'axios';

const MARKET_API_URL = process.env.ALEGRA_EXTERNAL_MARKETPLACE_API || '';
const MAIN_EXCHANGE = 'marketplace_exchange';
const PURCHASE_QUEUE = 'marketplace_purchase_queue';
const CONFIRMATION_QUEUE = 'purchase_confirmation_queue';

const WAIT_EXCHANGE = 'marketplace_wait_exchange';
const WAIT_QUEUE = 'marketplace_wait_queue';
const RETRY_DELAY_MS = 1500; // 1.5 segundos

interface IngredientToPurchase {
    name: string;
    quantity: number;
}

async function purchaseIngredient(ingredient: IngredientToPurchase): Promise<{ name: string; quantityBought: number } | null> {
    try {
        console.log(` -> Attempting to buy ${ingredient.quantity} of ${ingredient.name}...`);
        const response = await axios.get(`${MARKET_API_URL}?ingredient=${ingredient.name}`);
        const quantitySold = response.data.quantitySold;
        if (quantitySold > 0) {
            console.log(`    [v] Successfully bought ${quantitySold} of ${ingredient.name}.`);
            return { name: ingredient.name, quantityBought: quantitySold };
        } else {
            console.log(`    [x] Ingredient ${ingredient.name} not available at the market.`);
            return null;
        }
    } catch (error) {
        console.error(`    [!] Error purchasing ${ingredient.name}:`, error);
        return null;
    }
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
                    
                    const concurrencyLimit = 5; // Límite de cuántas llamadas a la API hacemos en paralelo
                    const purchaseTasks = [...ingredients]; // Copiamos las tareas a una lista que podemos modificar
                    const purchaseResults: { name: string; quantityBought: number; }[] = [];

                    // Función que define el trabajo de un "worker"
                    const worker = async () => {
                        // Mientras haya tareas en la lista...
                        while (purchaseTasks.length > 0) {
                            // ...toma la siguiente tarea de la lista.
                            const task = purchaseTasks.shift(); 
                            if (task) {
                                const result = await purchaseIngredient(task);
                                if (result) {
                                    purchaseResults.push(result);
                                }
                            }
                        }
                    };

                    // Creamos un array de "workers" según nuestro límite de concurrencia
                    const workerPromises = [];
                    for (let i = 0; i < concurrencyLimit; i++) {
                        workerPromises.push(worker());
                    }

                    // Esperamos a que todos los workers terminen (lo que ocurrirá cuando la lista de tareas se vacíe)
                    await Promise.all(workerPromises);

                     const successfulPurchases = purchaseResults; // Ya no necesitamos filtrar nulos si los manejamos dentro

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