import * as amqp from 'amqplib';
import dotenv from 'dotenv';

dotenv.config(); // Cargar variables de entorno

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672';

export async function sendToQueue(queue: string, message: object) {
    try {
        // 1. Crear conexión
        const connection = await amqp.connect(RABBITMQ_URL);

        // 2. Crear canal
        const channel = await connection.createChannel();

        // 3. Asegurar que la cola existe
        await channel.assertQueue(queue, { durable: true });

        // 4. Enviar mensaje
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));

        console.log(` [x] Sent message to ${queue}`);

        // 5. Cerrar conexión después de enviar (para pruebas)
        setTimeout(() => {
            connection.close();
        }, 500);
    } catch (error) {
        console.error('Error:', error);
    }
}