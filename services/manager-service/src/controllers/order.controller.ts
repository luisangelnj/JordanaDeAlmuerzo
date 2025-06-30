import { Request, Response, RequestHandler } from "express";
import { sendToQueue } from "../services/rabbitmq.service";
import { AppDataSource } from '../data-source';
import { OrderBatch, OrderStatus } from '../entities/OrderBatch.entity';

const OUTGOING_QUEUE = 'order_requests_queue';

const createOrder: RequestHandler = async (req, res) => {
    const { quantity } = req.body;

    if (!quantity || typeof quantity !== 'number' || quantity <= 0) {
        
        res.status(400).json({
            success: false,
            message: "A valid 'quantity' is required.",
        });
        return;
    }

    try {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }
        
        const orderRepository = AppDataSource.getRepository(OrderBatch);
        
        const newOrder = new OrderBatch();
        newOrder.quantity = quantity;
        newOrder.status = OrderStatus.PENDING;
        newOrder.statusDetail = "Order created successfully"

        await orderRepository.save(newOrder);

        const message = {
            batchId: newOrder.id,
            quantity: quantity,
            requestedAt: new Date().toISOString(),
        };

        await sendToQueue(OUTGOING_QUEUE, message);

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
        
        
        res.status(500).json({
            success: false,
            message: "Failed to process the order batch.",
        });
    }
};

const getAllOrders: RequestHandler = async (req, res) => {
    try {
        // Leemos el límite del query string, con un default de 5 y un máximo de 20.
        const limit = Math.min(parseInt(req.query.limit as string) || 5, 20);

        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }

        const orderRepository = AppDataSource.getRepository(OrderBatch);

        // Buscamos en la base de datos
        const orders = await orderRepository.find({
            order: {
                createdAt: 'DESC',
            },
            take: limit,
        });

        res.status(200).json({
            success: true,
            message: `Success retrieving the data`,
            data: orders
        });

    } catch (error) {
        
    }
}

export default {
    createOrder,
    getAllOrders
}