import { connect } from 'amqplib';
import { AppDataSource } from '../data-source';
import { PurchaseHistory } from '../entities/PurchaseHistory.entity';

const INCOMING_QUEUE = 'purchase_history_queue';

export const startPurchaseHistoryConsumer = async () => {
    try {
        if (!AppDataSource.isInitialized) { await AppDataSource.initialize(); }
        const connection = await connect(process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672');
        const channel = await connection.createChannel();
        await channel.assertQueue(INCOMING_QUEUE, { durable: true });
        await channel.prefetch(1);
        console.log(`[+] Manager Service waiting for purchase history in ${INCOMING_QUEUE}.`);

        channel.consume(INCOMING_QUEUE, async (msg) => {
            if (msg) {
                const historyRepo = AppDataSource.getRepository(PurchaseHistory);
                try {
                    const { purchasedItems, timestamp } = JSON.parse(msg.content.toString());
                    console.log('[db] Received purchase history update. Saving to local db...');
                    
                    const historyEntries = purchasedItems.map((item: { name: string; quantityBought: number; }) => {
                        const entry = new PurchaseHistory();
                        entry.ingredientName = item.name;
                        entry.quantityBought = item.quantityBought;
                        entry.purchasedAt = new Date(timestamp);
                        return entry;
                    });

                    await historyRepo.save(historyEntries);
                    channel.ack(msg);
                } catch (error) {
                    console.error("Error processing purchase history:", error);
                    channel.nack(msg, false, false);
                }
            }
        });
    } catch (error) {
        console.error('Failed to start Purchase History Consumer:', error);
    }
};