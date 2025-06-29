// services/manager-service/src/services/recipe.consumer.ts
import { connect } from 'amqplib';
import { cachedRecipes } from '../index'; // Importamos la variable caché

const RECIPE_LIST_QUEUE = 'recipe_list_queue';

export const startRecipeConsumer = async () => {
    try {
        const connection = await connect(process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672');
        const channel = await connection.createChannel();
        await channel.assertQueue(RECIPE_LIST_QUEUE, { durable: true });
        console.log(`[+] Manager Service waiting for recipe list in ${RECIPE_LIST_QUEUE}.`);

        channel.consume(RECIPE_LIST_QUEUE, (msg) => {
            if (msg) {
                const recipes = JSON.parse(msg.content.toString());
                Object.assign(cachedRecipes, recipes); // Actualizamos el contenido del caché
                console.log(`[cache] Recipe list updated with ${cachedRecipes.length} recipes.`);
                channel.ack(msg);
            }
        });
    } catch (error) {
        console.error('Failed to start Recipe Consumer:', error);
    }
};