import { connect } from 'amqplib';
import { AppDataSource } from '../data-source';
import { Inventory } from '../entities/Inventory.entity';
import { sendToQueue } from './rabbitmq.service';
import { In } from 'typeorm';

// Define las colas que este servicio usará
const INCOMING_QUEUE = 'ingredient_requests_queue';
const OUTGOING_QUEUE_MARKETPLACE = 'marketplace_purchase_queue'; // Para pedir a la plaza
const KITCHEN_CONFIRMATION_QUEUE = 'ingredient_ready_queue'; // Para notificar a la cocina

export const startWarehouseWorker = async () => {
    try {
        // 1. Conectarse a la Base de Datos al iniciar
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
            console.log('[v] Warehouse connected to the database.');
        }

        const connection = await connect(process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672');
        const channel = await connection.createChannel();

        await channel.assertQueue(INCOMING_QUEUE, { durable: true });
        console.log(`[*] Warehouse waiting for ingredient requests in ${INCOMING_QUEUE}.`);

        channel.consume(INCOMING_QUEUE, async (msg) => {
            if (msg !== null) {
                // 2. Obtener el Repositorio para interactuar con la tabla 'inventory'
                const inventoryRepository = AppDataSource.getRepository(Inventory);
                
                try {
                    const { batchId, ingredients: requiredIngredients } = JSON.parse(msg.content.toString());
                    console.log(`[x] Received ingredient request for batch ${batchId}.`);

                    // 3. Verificar disponibilidad de ingredientes consultando la BD
                    const ingredientNames = requiredIngredients.map((i: any) => i.name);
                    const stockItems = await inventoryRepository.findBy({ ingredientName: In(ingredientNames) });
                    const stockMap = new Map(stockItems.map(i => [i.ingredientName, i.quantity]));

                    const ingredientsToPurchase = [];
                    let needsToBuy = false;

                    for (const required of requiredIngredients) {
                        const currentStock = stockMap.get(required.name) || 0;
                        if (currentStock < required.quantity) {
                            needsToBuy = true;
                            ingredientsToPurchase.push({
                                name: required.name,
                                quantity: required.quantity - currentStock,
                            });
                        }
                    }

                    // 4. Procesar la solicitud
                    if (needsToBuy) {
                        // Unhappy Path: No hay suficiente stock
                        console.log(`[!] Insufficient stock for batch ${batchId}. Creating purchase order.`);
                        await sendToQueue(OUTGOING_QUEUE_MARKETPLACE, { batchId, ingredients: ingredientsToPurchase });
                    } else {
                        // Happy Path: ¡Tenemos todo!
                        console.log(`[v] All ingredients available for batch ${batchId}. Reserving ingredients.`);
                        
                        // 5. Descontar del inventario usando una TRANSACCIÓN para asegurar la integridad de los datos
                        await AppDataSource.manager.transaction(async (transactionalEntityManager) => {
                            for (const required of requiredIngredients) {
                                await transactionalEntityManager.decrement(
                                    Inventory,
                                    { ingredientName: required.name },
                                    "quantity",
                                    required.quantity
                                );
                            }
                        });
                        console.log(`[db] Inventory updated for batch ${batchId}.`);

                        // Notificar a cocina que los ingredientes están listos
                        await sendToQueue(KITCHEN_CONFIRMATION_QUEUE, { batchId, status: 'READY' });
                        console.log(`[>] Sent confirmation to kitchen for batch ${batchId}.`);
                    }

                    channel.ack(msg);
                } catch (error) {
                    console.error("Error processing ingredient request:", error);
                    channel.nack(msg, false, false);
                }
            }
        });
    } catch (error) {
        console.error('Failed to start Warehouse worker:', error);
    }
};