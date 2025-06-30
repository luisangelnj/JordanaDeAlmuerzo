import { connect } from 'amqplib';
import { recipes } from '../config/recipes';

const RECIPE_LIST_QUEUE = 'recipe_list_queue';

/**
 * Esta función se conecta a RabbitMQ para publicar la lista completa de recetas
 * una única vez al iniciar el servicio.
 */
export const publishRecipeList = async () => {
    try {
        const connection = await connect(process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672');
        const channel = await connection.createChannel();
        
        // Asegura que la cola exista y sea duradera
        await channel.assertQueue(RECIPE_LIST_QUEUE, { durable: true });
        
        // Envía el mensaje con la lista de recetas, marcado como persistente
        channel.sendToQueue(RECIPE_LIST_QUEUE, Buffer.from(JSON.stringify(recipes)), { persistent: true });
        
        console.log(`[event] Initial recipe list published to ${RECIPE_LIST_QUEUE}.`);

        // Cierra el canal y la conexión ya que solo se usó para una tarea
        await channel.close();
        await connection.close();

    } catch (error) {
        console.error('Could not publish initial recipe list:', error);
    }
};