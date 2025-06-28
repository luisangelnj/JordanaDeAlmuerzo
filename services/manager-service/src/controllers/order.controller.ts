import { Request, Response, RequestHandler } from "express";
import { sendToQueue } from "../services/rabbitmq.service";
import { v4 as uuidv4 } from 'uuid';
import { AppDataSource } from '../data-source';
import { OrderBatch, OrderStatus } from '../entities/OrderBatch.entity';

// 2. Usa el tipo RequestHandler para tipar el controlador.
//    Esto asegura que la firma sea la correcta (req, res, next).
export const createOrderController: RequestHandler = async (req, res) => {
    const { quantity } = req.body;

    if (!quantity || typeof quantity !== 'number' || quantity <= 0) {
        // 3. NO uses "return" aquí. La función ya envía la respuesta.
        res.status(400).json({
            success: false,
            message: "A valid 'quantity' is required.",
        });
        return; // Usa un return vacío para detener la ejecución
    }

    try {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }
        
        const orderRepository = AppDataSource.getRepository(OrderBatch);
        
        const newOrder = new OrderBatch();
        newOrder.quantity = quantity;
        newOrder.status = OrderStatus.PENDING;

        await orderRepository.save(newOrder);

        const message = {
            batchId: newOrder.id,
            quantity: quantity,
            requestedAt: new Date().toISOString(),
        };

        await sendToQueue("order_requests_queue", message);

        res.status(202).json({
            success: true,
            message: `Order batch for ${quantity} dishes received and is being processed.`,
            data: {
                orderId: newOrder.id,
                quantity: newOrder.quantity
            }
        });
    } catch (error) {
        console.error("Error publishing order batch to queue:", error);
        
        // 5. Y tampoco aquí.
        res.status(500).json({
            success: false,
            message: "Failed to process the order batch.",
        });
    }
};