import { connect } from 'amqplib';
import { AppDataSource } from '../data-source';
import { PreparedDish, DishStatus } from '../entities/PreparedDish.entity';
import { sendToQueue } from './rabbitmq.service';

const INCOMING_QUEUE = 'ingredient_ready_queue';
const ORDER_STATUS_UPDATE_QUEUE = 'order_status_update_queue';

// Tiempo simulado de cocción de órden (Simular tiempo de cocción en dashboard)
export function getCookTimeMs(dishCount: number): number {
    const MAX_COOK_MS = 6_000;            // 6 s tope duro
    const PER_DISH_MS = 200;              // 0,2 s por platillo (ajusta a tu gusto)
    const time = dishCount * PER_DISH_MS; // crecimiento lineal
    return Math.min(time, MAX_COOK_MS);
}

export const startIngredientConfirmationConsumer = async () => {
    try {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }
        const connection = await connect(process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672');
        const channel = await connection.createChannel();

        await channel.assertQueue(INCOMING_QUEUE, { durable: true });
        await channel.prefetch(1);
        console.log(`[+] Kitchen Ingredient Consumer waiting for messages in ${INCOMING_QUEUE}.`);

        channel.consume(INCOMING_QUEUE, async (msg) => {
            if (msg !== null) {
                const dishRepo = AppDataSource.getRepository(PreparedDish);
                try {
                    const { batchId } = JSON.parse(msg.content.toString());
                    console.log(`[+] Ingredients are ready for batch ${batchId}. Starting preparation.`);

                    const statusUpdateMessage = {
                        batchId,
                        status: 'PREPARING_DISHES',
                        statusDetail: 'All ingredients received. Dish preparation in progress.'
                    };
                    await sendToQueue(ORDER_STATUS_UPDATE_QUEUE, statusUpdateMessage);

                    // 1. Actualizar el estado de todos los platos de este lote a 'PREPARING'
                    await dishRepo.update(
                        { batchId },
                        { status: DishStatus.PREPARING }
                    );
                    console.log(`[db] Dishes for batch ${batchId} are now PREPARING.`);

                    const dishesForBatch = await dishRepo.findBy({ batchId });
                    const dishCount = dishesForBatch.length;   // 👈 aquí obtienes la cantidad

                    // 2. Calcular el tiempo de cocción dinámico
                    const cookTimeMs = getCookTimeMs(dishCount);

                    // 2. Simular el tiempo de preparación de los platos
                    console.log(`... Simulating cooking time for ${dishCount} dish(es) for ${cookTimeMs / 1000} seconds...`);
                    await new Promise(resolve => setTimeout(resolve, cookTimeMs));

                    // 3. Actualizar el estado de todos los platos a 'COMPLETED'
                    await dishRepo.update({ batchId }, { status: DishStatus.COMPLETED });
                    console.log(`[v] All dishes for batch ${batchId} are COMPLETED.`);

                    const finalMessage = {
                        batchId,
                        status: 'COMPLETED',
                        // preparedDishes: dishNames
                    };
                    await sendToQueue(ORDER_STATUS_UPDATE_QUEUE, finalMessage);
                    console.log(`[>] FINAL completion message for batch ${batchId} sent to ${ORDER_STATUS_UPDATE_QUEUE}.`);

                    channel.ack(msg);
                } catch (error) {
                    console.error("Error processing ingredient confirmation:", error);
                    channel.nack(msg, false, false);
                }
            }
        });
    } catch (error) {
        console.error('Failed to start Ingredient Confirmation Consumer:', error);
    }
};