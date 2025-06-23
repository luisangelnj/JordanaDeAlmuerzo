// 1. Importa RequestHandler junto a Request y Response
import { Request, Response, RequestHandler } from "express";
import { sendToQueue } from "../services/rabbitmq.service";
import { v4 as uuidv4 } from 'uuid';

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

    const orderBatch = {
        batchId: uuidv4(),
        quantity: quantity,
        requestedAt: new Date().toISOString(),
    };

    try {
        await sendToQueue("order_requests_queue", orderBatch);

        // 4. Tampoco uses "return" aquí.
        res.status(202).json({
            success: true,
            message: `Order batch for ${quantity} dishes received and is being processed.`,
            batchId: orderBatch.batchId,
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