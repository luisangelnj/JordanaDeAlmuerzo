import { connect } from 'amqplib';
import { AppDataSource } from '../data-source';
import { Inventory } from '../entities/Inventory.entity';
import { IngredientRequest, RequestStatus } from '../entities/IngredientRequest.entity';
import { sendToQueue } from './rabbitmq.service';
import { In } from 'typeorm';
import { publishInventoryUpdate } from './warehouse.worker';

const INCOMING_QUEUE = 'purchase_confirmation_queue';
const KITCHEN_CONFIRMATION_QUEUE = 'ingredient_ready_queue';
const MARKETPLACE_PURCHASE_QUEUE = 'marketplace_purchase_queue';
const PURCHASE_HISTORY_QUEUE = 'purchase_history_queue';

export const startPurchaseConsumer = async () => {
    try {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }
        const connection = await connect(process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672');
        const channel = await connection.createChannel();

        await channel.assertQueue(INCOMING_QUEUE, { durable: true });
        await channel.prefetch(1);
        console.log(`[+] Warehouse Purchase Consumer waiting for purchase confirmations in ${INCOMING_QUEUE}.`);

        channel.consume(INCOMING_QUEUE, async (msg) => {
            if (msg !== null) {
                const inventoryRepo = AppDataSource.getRepository(Inventory);
                const requestRepo = AppDataSource.getRepository(IngredientRequest);

                try {
                    const { batchId, purchasedIngredients } = JSON.parse(msg.content.toString());
                    console.log(`[+] Received purchase confirmation for batch ${batchId}.`);

                    if (purchasedIngredients.length > 0) {
                        // Ordenar los ingredientes alfabéticamente por nombre antes de la transacción.
                        const sortedIngredients = purchasedIngredients.sort((a: { name: string; }, b: { name: any; }) => a.name.localeCompare(b.name));
                            await AppDataSource.manager.transaction(async (manager) => {
                            // Iterar sobre la lista YA ORDENADA.
                            for (const item of sortedIngredients) {
                                await manager.increment(Inventory, { ingredientName: item.name }, "quantity", item.quantityBought);
                            }
                        });
                        console.log(`[db] Inventory updated for batch ${batchId}.`);
                        await publishInventoryUpdate();
                        // Después de actualizar el stock, publica un evento con la información de la compra.
                        const historyMessage = {
                            purchasedItems: purchasedIngredients,
                            timestamp: new Date()
                        };
                        await sendToQueue(PURCHASE_HISTORY_QUEUE, historyMessage);
                        console.log(`[event] Published purchase history event for batch ${batchId}.`);
                    }

                    const originalRequest = await requestRepo.findOneBy({ batchId });
                    if (!originalRequest) {
                        throw new Error(`Could not find original ingredient request for batchId: ${batchId}`);
                    }

                    const requiredIngredientNames = originalRequest.requestedIngredients.map((i: any) => i.name);
                    const currentStockItems = await inventoryRepo.findBy({ ingredientName: In(requiredIngredientNames) });
                    const currentStockMap = new Map(currentStockItems.map(i => [i.ingredientName, i.quantity]));
                    
                    const stillMissingIngredients = [];
                    let isOrderComplete = true;

                    for (const required of originalRequest.requestedIngredients as any[]) {
                        const stock = currentStockMap.get(required.name) || 0;
                        if (stock < required.quantity) {
                            isOrderComplete = false;
                            stillMissingIngredients.push({ name: required.name, quantity: required.quantity - stock });
                        }
                    }

                    if (isOrderComplete) {
                        // Aquí el pedido debe estár completo.
                        console.log(`[v] Purchase complete! All ingredients for batch ${batchId} are now available.`);

                        // Ordenar la lista de ingredientes requeridos alfabéticamente
                        const sortedRequiredIngredients = (originalRequest.requestedIngredients as any[]).sort((a, b) => a.name.localeCompare(b.name));

                        await AppDataSource.manager.transaction(async (manager) => {
                            // Iterar sobre la lista YA ORDENADA.
                            for (const required of sortedRequiredIngredients) {
                                await manager.decrement(Inventory, { ingredientName: required.name }, "quantity", required.quantity);
                            }
                            // Marcar la solicitud como completada
                            await manager.update(IngredientRequest, { batchId }, { status: RequestStatus.COMPLETED });
                        });

                        await sendToQueue(KITCHEN_CONFIRMATION_QUEUE, { batchId, status: 'READY' });
                        console.log(`[>] FINAL confirmation sent to kitchen for batch ${batchId}.`);
                        await publishInventoryUpdate();

                    } else {
                        // Si aún faltan cosas por comprar. Volver a enviar un pedido de compra solo con lo que falta.
                        console.log(`[!] Order for batch ${batchId} still incomplete. Re-issuing purchase order for remaining items.`);
                        await sendToQueue(MARKETPLACE_PURCHASE_QUEUE, { batchId, ingredients: stillMissingIngredients });
                    }

                    channel.ack(msg);
                } catch (error) {
                    console.error("Error processing purchase confirmation:", error);
                    channel.nack(msg, false, false);
                }
            }
        });
    } catch (error) {
        console.error('Failed to start Purchase Consumer:', error);
    }
};