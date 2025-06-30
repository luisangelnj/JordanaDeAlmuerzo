// services/manager-service/src/services/status.consumer.ts

import { connect } from 'amqplib';
import { AppDataSource } from '../data-source';
import { OrderBatch, OrderStatus } from '../entities/OrderBatch.entity';

// Este consumidor escucha la única cola para todas las actualizaciones de estado.
const ORDER_STATUS_UPDATE_QUEUE = 'order_status_update_queue';

export const startStatusConsumer = async () => {
    try {
        // Conectarse a la base de datos del manager
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }
        // Conectarse a RabbitMQ
        const connection = await connect(process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672');
        const channel = await connection.createChannel();

        await channel.assertQueue(ORDER_STATUS_UPDATE_QUEUE, { durable: true });
        await channel.prefetch(1);
        console.log(`[+] Manager Service waiting for status updates in ${ORDER_STATUS_UPDATE_QUEUE}.`);

        channel.consume(ORDER_STATUS_UPDATE_QUEUE, async (msg) => {
            if (msg !== null) {
                const orderRepo = AppDataSource.getRepository(OrderBatch);
                try {
                    // El mensaje puede tener diferentes campos opcionales dependiendo del evento
                    const { batchId, status, statusDetail, preparedDishes } = JSON.parse(msg.content.toString());
                    console.log(`[status] Received status update for batch ${batchId}: ${status}`);

                    // 1. Encontrar la orden original en la base de datos
                    const order = await orderRepo.findOneBy({ id: batchId });

                    if (order) {
                        // 2. Actualizar su estado y detalles dinámicamente
                        order.status = status as OrderStatus;
                        
                        if (statusDetail) {
                            order.statusDetail = statusDetail;
                        }

                        console.log(preparedDishes);
                        

                        // 3. Si es el estado final "COMPLETED", guarda la lista de platos.
                        //    (Asegúrate de tener la columna 'dishes' de tipo jsonb en tu entidad OrderBatch)
                        if (status === OrderStatus.COMPLETED && preparedDishes) {
                            order.statusDetail = 'Order completed and all dishes delivered.';
                        }
                        
                        await orderRepo.save(order);
                        console.log(`[db] Order batch ${batchId} status updated to ${status}.`);
                    } else {
                        console.warn(`[!] Received status update for a non-existent order batch: ${batchId}`);
                    }
                    
                    channel.ack(msg);

                } catch (error) {
                    console.error("Error processing status update message:", error);
                    channel.nack(msg, false, false);
                }
            }
        });

    } catch (error) {
        console.error('Failed to start Status Consumer:', error);
    }
};