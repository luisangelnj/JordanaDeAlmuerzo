import { connect } from 'amqplib';
import axios from 'axios';
import { sendToQueue } from './rabbitmq.service'; // Asume que tienes este servicio

const MARKET_API_URL = process.env.ALEGRA_EXTERNAL_MARKETPLACE_API || ''; // Reemplaza con la URL real del reto
const INCOMING_QUEUE = 'marketplace_purchase_queue';
const OUTGOING_QUEUE = 'purchase_confirmation_queue';

// Interfaz para el tipo de ingrediente que se espera recibir
interface IngredientToPurchase {
    name: string;
    quantity: number; // La cantidad que el almacén necesita
}

/**
 * Función auxiliar para comprar un solo ingrediente.
 */
async function purchaseIngredient(ingredient: IngredientToPurchase): Promise<{ name: string; quantityBought: number } | null> {
    try {
        console.log(` -> Attempting to buy ${ingredient.quantity} of ${ingredient.name}...`);
        
        // Se hace la llamada a la API externa por cada ingrediente
        const response = await axios.get(`${MARKET_API_URL}?ingredient=${ingredient.name}`);
        
        const quantitySold = response.data.quantitySold;

        // Se considera una compra exitosa si la cantidad es mayor a cero 
        if (quantitySold > 0) {
            // Podríamos comprar más de lo que necesitamos, pero solo reportamos lo que compramos.
            console.log(`    [v] Successfully bought ${quantitySold} of ${ingredient.name}.`);
            return { name: ingredient.name, quantityBought: quantitySold };
        } else {
            // El ingrediente no estaba disponible en la plaza 
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

        await channel.assertQueue(INCOMING_QUEUE, { durable: true });
        console.log(`[*] Marketplace waiting for purchase requests in ${INCOMING_QUEUE}.`);

        channel.consume(INCOMING_QUEUE, async (msg) => {
            if (msg !== null) {
                try {
                    const { batchId, ingredients } = JSON.parse(msg.content.toString());
                    console.log(`[x] Received purchase request for batch ${batchId}.`);

                    // Hacemos todas las llamadas a la API en paralelo para mayor eficiencia
                    const purchasePromises = ingredients.map(purchaseIngredient);
                    const purchaseResults = await Promise.all(purchasePromises);

                    // Filtramos solo las compras que fueron exitosas (no nulas)
                    const successfulPurchases = purchaseResults.filter(r => r !== null);

                    if (successfulPurchases.length > 0) {
                        // Construimos el mensaje de confirmación para el almacén
                        const confirmationMessage = {
                            batchId,
                            purchasedIngredients: successfulPurchases
                        };
                        
                        // Enviamos la confirmación a la cola del almacén
                        await sendToQueue(OUTGOING_QUEUE, confirmationMessage);
                        console.log(`[>] Sent purchase confirmation for batch ${batchId} to ${OUTGOING_QUEUE}.`);
                    } else {
                        console.log(`[!] No ingredients could be purchased for batch ${batchId}.`);
                        // Aquí se podría implementar la lógica de reintento como lo pide el requisito.
                        // Por ahora, simplemente no enviamos confirmación si no se compró nada.
                    }

                    channel.ack(msg);
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