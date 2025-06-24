import { connect } from 'amqplib';
import { sendToQueue } from './rabbitmq.service'; // Asumimos que tienes un servicio similar al de kitchen

// Define las colas que este servicio usará
const INCOMING_QUEUE = 'ingredient_requests_queue';
const OUTGOING_QUEUE_MARKETPLACE = 'marketplace_purchase_queue'; // Para pedir a la plaza
const KITCHEN_CONFIRMATION_QUEUE = 'ingredient_ready_queue'; // Para notificar a la cocina

// Simulación de la base de datos de inventario.
// Inicia con 5 unidades de cada ingrediente.
const inventory = new Map<string, number>([
    ["Tomato", 5], ["Lemon", 5], ["Potato", 5], ["Rice", 5],
    ["Ketchup", 5], ["Lettuce", 5], ["Onion", 5], ["Cheese", 5],
    ["Meat", 5], ["Chicken", 5]
]);

export const startWarehouseWorker = async () => {
    try {
        const connection = await connect(process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672');
        const channel = await connection.createChannel();

        await channel.assertQueue(INCOMING_QUEUE, { durable: true });
        console.log(`[*] Warehouse waiting for ingredient requests in ${INCOMING_QUEUE}.`);

        channel.consume(INCOMING_QUEUE, async (msg) => {
            if (msg !== null) {
                try {
                    const { batchId, ingredients } = JSON.parse(msg.content.toString());
                    console.log(`[x] Received ingredient request for batch ${batchId}.`);
                    console.log('Required ingredients:', ingredients);

                    const ingredientsToPurchase = [];
                    const ingredientsToReserve = [];

                    // 1. Verificar disponibilidad de ingredientes 
                    for (const item of ingredients) {
                        const currentStock = inventory.get(item.name) || 0;
                        if (currentStock < item.quantity) {
                            // No hay suficiente, hay que comprar la diferencia
                            ingredientsToPurchase.push({
                                name: item.name,
                                quantity: item.quantity - currentStock,
                            });
                        } else {
                            ingredientsToReserve.push(item);
                        }
                    }

                    // 2. Procesar la solicitud
                    if (ingredientsToPurchase.length > 0) {
                        // Hay que comprar. Enviamos un mensaje a la plaza de mercado.
                        const purchaseRequest = {
                            batchId,
                            ingredients: ingredientsToPurchase,
                            // Guardamos los ingredientes que sí teníamos para más tarde.
                            reservedIngredients: ingredientsToReserve 
                        };
                        
                        await sendToQueue(OUTGOING_QUEUE_MARKETPLACE, purchaseRequest);
                        console.log(`[!] Short on stock. Sent purchase request to ${OUTGOING_QUEUE_MARKETPLACE} for batch ${batchId}.`);
                    } else {
                        // ¡Tenemos todo! Reservamos y notificamos a la cocina.
                        console.log(`[v] All ingredients available for batch ${batchId}.`);
                        
                        // Descontamos del inventario 
                        ingredients.forEach((item: { name: string; quantity: number; }) => {
                            const currentStock = inventory.get(item.name) || 0;
                            inventory.set(item.name, currentStock - item.quantity);
                        });
                        console.log('Updated inventory:', Object.fromEntries(inventory));
                        
                        // Notificamos a cocina que los ingredientes están listos
                        await sendToQueue(KITCHEN_CONFIRMATION_QUEUE, { batchId, status: 'READY' });
                        console.log(`[>] Sent confirmation to kitchen for batch ${batchId}.`);
                    }

                    channel.ack(msg);
                } catch (error) {
                    console.error("Error processing ingredient request:", error);
                    channel.nack(msg, false, false); // No reencolar para evitar bucles infinitos
                }
            }
        });
    } catch (error) {
        console.error('Failed to start Warehouse worker:', error);
        // Implementar lógica de reconexión para robustez
    }
};