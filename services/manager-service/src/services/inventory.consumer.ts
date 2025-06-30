// services/manager-service/src/services/inventory.consumer.ts
import { connect } from 'amqplib';
import { AppDataSource } from '../data-source';
import { CachedInventory } from '../entities/CachedInventory.entity';

const INVENTORY_UPDATES_QUEUE = 'inventory_updates_queue';

export const startInventoryConsumer = async () => {
    try {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }
        const connection = await connect(process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672');
        const channel = await connection.createChannel();
        
        await channel.assertQueue(INVENTORY_UPDATES_QUEUE, { durable: true });
        await channel.prefetch(1);
        console.log(`[+] Manager Service waiting for inventory updates in ${INVENTORY_UPDATES_QUEUE}.`);

        channel.consume(INVENTORY_UPDATES_QUEUE, async (msg) => {
            if (msg !== null) {
                const inventoryRepo = AppDataSource.getRepository(CachedInventory);
                try {
                    const inventoryData = JSON.parse(msg.content.toString());
                    console.log('[db] Received inventory update. Updating local cache...');
                    
                    // 'save' actúa como un 'upsert' (update or insert) si la entidad tiene una clave primaria.
                    // Esto actualizará los registros existentes o creará nuevos si no existen.
                    await inventoryRepo.save(inventoryData);

                    channel.ack(msg);
                } catch (error) {
                    console.error("Error processing inventory update:", error);
                    channel.nack(msg, false, false);
                }
            }
        });
    } catch (error) {
        console.error('Failed to start Inventory Consumer:', error);
    }
};