import { connect } from 'amqplib';
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672';

/**
 * Conecta, envía un mensaje a una cola y luego se desconecta.
 * Un enfoque simple y directo para enviar un mensaje.
 * @param queue El nombre de la cola.
 * @param message El objeto del mensaje a enviar.
 */
export const sendToQueue = async (queue: string, message: object) => {
  let connection;
  try {
    // 1. Conectar a RabbitMQ
    connection = await connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    // 2. Asegurar que la cola existe
    await channel.assertQueue(queue, { durable: true });

    // 3. Enviar el mensaje
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
      // Marcar el mensaje como persistente para que sobreviva a reinicios de RabbitMQ
      persistent: true,
    });
    
    console.log(`[x] Sent message to queue: ${queue}`);

  } catch (error) {
    console.error('Error al enviar el mensaje a RabbitMQ:', error);
    // Es importante relanzar el error para que el controlador sepa que algo falló
    throw error;
  } finally {
    // 4. Cerrar la conexión, tanto si hubo éxito como si hubo un error
    if (connection) {
      // Se usa un pequeño retardo para asegurar que el mensaje se envíe antes de cerrar
      await new Promise(resolve => setTimeout(resolve, 500));
      await connection.close();
    }
  }
};