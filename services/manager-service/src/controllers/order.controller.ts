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
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.perPage as string) || 15;
        const skip = (page - 1) * limit;

        
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }
        
        const orderRepo = AppDataSource.getRepository(OrderBatch);

        const [result, total] = await orderRepo
        .createQueryBuilder('order')
        .orderBy(`
            CASE 
                WHEN status = 'PENDING' THEN 1
                WHEN status = 'PENDING_INGREDIENTS' THEN 2
                WHEN status = 'PREPARING_DISHES' THEN 3
                WHEN status = 'PURCHASING_INGREDIENTS' THEN 4
                WHEN status = 'COMPLETED' THEN 5
                ELSE 6
            END
        `)
        .addOrderBy('order.createdAt', 'DESC')
        .skip(skip)
        .take(limit)
        .getManyAndCount();

        res.status(200).json({
            data: result,
            total,
            page,
            lastPage: Math.ceil(total / limit),
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: `Something went wrong`,
            error: error
        });
    }
}

export default {
    createOrder,
    getAllOrders
}