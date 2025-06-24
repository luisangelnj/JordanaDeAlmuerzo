import { connect } from 'amqplib';
import { recipes, Ingredient } from '../config/recipes';
import { sendToQueue } from './rabbitmq.service';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672';
const INCOMING_QUEUE = 'order_requests_queue';
const OUTGOING_QUEUE = 'ingredient_requests_queue';

export const startKitchenWorker = async () => {
    try {
        const connection = await connect(RABBITMQ_URL);
        const channel = await connection.createChannel();

        await channel.assertQueue(INCOMING_QUEUE, { durable: true });
        console.log(`[*] Kitchen waiting for orders in ${INCOMING_QUEUE}.`);

        channel.consume(INCOMING_QUEUE, async (msg) => {
            if (msg !== null) {
                try {
                    const { batchId, quantity } = JSON.parse(msg.content.toString());
                    console.log(`[x] Received order batch ${batchId} for ${quantity} dishes.`);

                    // 1. Seleccionar recetas aleatoriamente
                    const requiredIngredients = new Map<string, number>();
                    for (let i = 0; i < quantity; i++) {
                        const randomRecipe = recipes[Math.floor(Math.random() * recipes.length)];
                        console.log(` -> Preparing dish ${i+1}/${quantity}: ${randomRecipe.name}`);
                        
                        // 2. Agregar los ingredientes
                        randomRecipe.ingredients.forEach(ingredient => {
                            const currentQuantity = requiredIngredients.get(ingredient.name) || 0;
                            requiredIngredients.set(ingredient.name, currentQuantity + ingredient.quantity);
                        });
                    }

                    // 3. Construir el mensaje para la bodega
                    const ingredientRequest = {
                        batchId: batchId,
                        ingredients: Array.from(requiredIngredients.entries()).map(([name, quantity]) => ({ name, quantity })),
                    };

                    // 4. Enviar a la cola de la bodega 
                    await sendToQueue(OUTGOING_QUEUE, ingredientRequest);
                    console.log(`[v] Sent ingredient request for batch ${batchId} to ${OUTGOING_QUEUE}.`);

                    channel.ack(msg); // Confirma que el mensaje fue procesado correctamente
                } catch (error) {
                    console.error("Error processing message:", error);
                    // Aquí podrías reenviar a una cola de "letras muertas" (dead-letter queue)
                    channel.nack(msg, false, false);
                }
            }
        });

    } catch (error) {
        console.error('Failed to start Kitchen worker:', error);
        // Implementar lógica de reconexión
    }
};