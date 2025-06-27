import { connect } from 'amqplib';
import { AppDataSource } from '../data-source';
import { OrderBatch, OrderStatus } from '../entities/OrderBatch.entity';

const INCOMING_QUEUE = 'order_completion_queue';

export const startOrderCompletionConsumer = async () => {
    try {
        // Conectarse a la base de datos del manager
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }
        // Conectarse a RabbitMQ
        const connection = await connect(process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672');
        const channel = await connection.createChannel();

        await channel.assertQueue(INCOMING_QUEUE, { durable: true });
        console.log(`[+] Manager Service waiting for completed orders in ${INCOMING_QUEUE}.`);

        channel.consume(INCOMING_QUEUE, async (msg) => {
            if (msg !== null) {
                const orderRepo = AppDataSource.getRepository(OrderBatch);
                try {
                    const { batchId, status, preparedDishes } = JSON.parse(msg.content.toString());
                    console.log(`[v] Received completion update for batch ${batchId} with status ${status}.`);

                    if (status === 'COMPLETED') {
                        // 1. Encontrar la orden original en la base de datos
                        const order = await orderRepo.findOneBy({ id: batchId });

                        if (order) {
                            // 2. Actualizar su estado y guardar los detalles
                            order.status = OrderStatus.COMPLETED;
                            // Columna 'notes' o 'details' de tipo JSON para guardar esto
                            // Por ahora, lo mostraremos en un log.
                            console.log(`[db] Dishes for batch ${batchId}:`, preparedDishes);

                            await orderRepo.save(order);
                            console.log(`[db] Order batch ${batchId} status updated to COMPLETED.`);
                        } else {
                            console.warn(`[!] Received completion for a non-existent order batch: ${batchId}`);
                        }
                    }

                    channel.ack(msg);

                } catch (error) {
                    console.error("Error processing order completion message:", error);
                    channel.nack(msg, false, false);
                }
            }
        });

    } catch (error) {
        console.error('Failed to start Order Completion Consumer:', error);
    }
};