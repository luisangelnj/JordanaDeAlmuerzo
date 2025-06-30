import { connect } from 'amqplib';
import { recipes, Ingredient } from '../config/recipes';
import { sendToQueue } from './rabbitmq.service';
import { AppDataSource } from '../data-source';
import { DishStatus, PreparedDish } from '../entities/PreparedDish.entity';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672';
const INCOMING_QUEUE = 'order_requests_queue';
const OUTGOING_QUEUE = 'ingredient_requests_queue';
const ORDER_STATUS_UPDATE_QUEUE = 'order_status_update_queue';

export const startKitchenWorker = async () => {
    try {
        
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
            console.log('[v] Kitchen connected to the database.');
        }

        const connection = await connect(RABBITMQ_URL);
        const channel = await connection.createChannel();

        await channel.assertQueue(INCOMING_QUEUE, { durable: true });
        await channel.prefetch(1);
        console.log(`[*] Kitchen waiting for orders in ${INCOMING_QUEUE}.`);

        channel.consume(INCOMING_QUEUE, async (msg) => {
            if (msg !== null) {
                try {
                    const { batchId, quantity } = JSON.parse(msg.content.toString());
                    console.log(`[x] Received order batch ${batchId} for ${quantity} dishes.`);

                    // Selección de recetas aleatoriamente
                    const preparedDishes: { name: string }[] = [];
                    for (let i = 0; i < quantity; i++) {
                        const randomRecipe = recipes[Math.floor(Math.random() * recipes.length)];
                        preparedDishes.push({ name: randomRecipe.name });
                    }
                    console.log(` -> Selected ${quantity} random dishes for batch ${batchId}.`);
                    
                    const preparedDishRepository = AppDataSource.getRepository(PreparedDish);
                    const dishesToSave = preparedDishes.map(dish => {
                        const newDish = new PreparedDish();
                        newDish.batchId = batchId;
                        newDish.dishName = dish.name;
                        return newDish;
                    });
                    await preparedDishRepository.save(dishesToSave);
                    console.log(`[db] Saved ${dishesToSave.length} prepared dish records for batch ${batchId}.`);
                    
                    const dishNames = preparedDishes.map(d => d.name);
                    const selectedDishesMessage = {
                        batchId,
                        preparedDishes: dishNames
                    };
                    await sendToQueue(ORDER_STATUS_UPDATE_QUEUE, selectedDishesMessage);
                    console.log(`[>] Selected dishes message for batch ${batchId} sent to ${ORDER_STATUS_UPDATE_QUEUE}.`);

                    const requiredIngredients = new Map<string, number>();
                    // (Lógica para calcular ingredientes basada en las recetas seleccionadas)
                    preparedDishes.forEach(dish => {
                        const recipe = recipes.find(r => r.name === dish.name);
                        if (recipe) {
                            recipe.ingredients.forEach(ingredient => {
                                const currentQuantity = requiredIngredients.get(ingredient.name) || 0;
                                requiredIngredients.set(ingredient.name, currentQuantity + ingredient.quantity);
                            });
                        }
                    });

                    // Construir y enviar el mensaje para la bodega
                    const ingredientRequest = {
                        batchId: batchId,
                        ingredients: Array.from(requiredIngredients.entries()).map(([name, quantity]) => ({ name, quantity })),
                    };
                    await sendToQueue(OUTGOING_QUEUE, ingredientRequest);
                    console.log(`[v] Sent ingredient request for batch ${batchId} to ${OUTGOING_QUEUE}.`);

                    channel.ack(msg);
                } catch (error) {
                    console.error("Error processing message:", error);
                    channel.nack(msg, false, false);
                }
            }
        });
    } catch (error) {
        console.error('Failed to start Kitchen worker:', error);
    }
};