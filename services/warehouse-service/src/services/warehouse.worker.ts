import { connect } from 'amqplib';
import { AppDataSource } from '../data-source';
import { Inventory } from '../entities/Inventory.entity';
import { IngredientRequest, RequestStatus } from '../entities/IngredientRequest.entity';
import { sendToQueue } from './rabbitmq.service';
import { In } from 'typeorm';

// Define las colas que este servicio usará
const INCOMING_QUEUE = 'ingredient_requests_queue';

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
                
                const inventoryRepository = AppDataSource.getRepository(Inventory);
                const requestRepository = AppDataSource.getRepository(IngredientRequest);
                
                try {
    
                    const { batchId, ingredients: requiredIngredients } = JSON.parse(msg.content.toString());
                    console.log(`[x] Received ingredient request for batch ${batchId}.`);

                    // Verificamos stock en almacén
                    const stockItems = await inventoryRepository.findBy({ ingredientName: In(requiredIngredients.map((i: any) => i.name)) });
                    const stockMap = new Map(stockItems.map(i => [i.ingredientName, i.quantity]));
                    const ingredientsToPurchase = [];
                    let needsToBuy = false;
                    for (const required of requiredIngredients) {
                        const currentStock = stockMap.get(required.name) || 0;
                        if (currentStock < required.quantity) {
                            needsToBuy = true;
                            ingredientsToPurchase.push({ name: required.name, quantity: required.quantity - currentStock });
                        }
                    }

                    if (needsToBuy) {
                        
                        console.log(`[!] Insufficient stock for batch ${batchId}. Saving request state and creating purchase order.`);

                        // 1. Crear el registro de la solicitud pendiente en la BD
                        const newRequest = new IngredientRequest();
                        newRequest.batchId = batchId;
                        newRequest.status = RequestStatus.PENDING_PURCHASE;
                        newRequest.requestedIngredients = requiredIngredients; // Guardamos el pedido original completo

                        await requestRepository.save(newRequest);
                        console.log(`[db] Saved ingredient request for batch ${batchId} with status PENDING_PURCHASE.`);

                        // 2. Publicar el mensaje a mercado
                        await sendToQueue('marketplace_purchase_queue', { batchId, ingredients: ingredientsToPurchase });

                    } else {
                        
                        console.log(`[v] All ingredients available for batch ${batchId}. Reserving ingredients.`);
                        await AppDataSource.manager.transaction(async (manager) => {
                            for (const required of requiredIngredients) {
                                await manager.decrement(Inventory, { ingredientName: required.name }, "quantity", required.quantity);
                            }
                        });
                        console.log(`[db] Inventory updated for batch ${batchId}.`);
                        await sendToQueue('ingredient_ready_queue', { batchId, status: 'READY' });
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