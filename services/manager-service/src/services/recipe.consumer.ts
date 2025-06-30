// services/manager-service/src/services/recipe.consumer.ts
import { connect } from 'amqplib';
import { AppDataSource } from '../data-source';
import { CachedRecipe } from '../entities/CachedRecipe.entity';

const RECIPE_LIST_QUEUE = 'recipe_list_queue';

export const startRecipeConsumer = async () => {
    try {
        if (!AppDataSource.isInitialized) { await AppDataSource.initialize(); }
        const connection = await connect(process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672');
        const channel = await connection.createChannel();
        await channel.assertQueue(RECIPE_LIST_QUEUE, { durable: true });

        console.log(`[+] Manager Service waiting for recipe list in ${RECIPE_LIST_QUEUE}.`);

        channel.consume(RECIPE_LIST_QUEUE, async (msg) => {
            if (msg) {
                const recipeRepo = AppDataSource.getRepository(CachedRecipe);
                try {
                    const recipesFromEvent = JSON.parse(msg.content.toString());
                    console.log('[db] Received recipe list. Updating local database cache...');

                    await recipeRepo.save(recipesFromEvent);
                    console.log(`[db] Recipe cache updated with ${recipesFromEvent.length} recipes.`);

                    channel.ack(msg);
                } catch (error) {
                    console.error("Error processing recipe list:", error);
                    // No hacemos nack para no perder el único mensaje del menú si la BD falla momentáneamente
                }
            }
        });
    } catch (error) {
        console.error('Failed to start Recipe Consumer:', error);
    }
};