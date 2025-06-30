import { Request, Response, RequestHandler } from "express";
import { sendToQueue } from "../services/rabbitmq.service";
import { AppDataSource } from '../data-source';
import { PurchaseHistory } from '../entities/PurchaseHistory.entity';

const getAllPurchaseHistory: RequestHandler = async (req, res) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 30;
        const skip = (page - 1) * limit;

        const purchaseRepo = AppDataSource.getRepository(PurchaseHistory);

        const [result, total] = await purchaseRepo.findAndCount({
            order: { purchasedAt: 'DESC' },
            take: limit,
            skip: skip,
        });

        res.status(200).json({
            data: result,
            total,
            page,
            lastPage: Math.ceil(total / limit)
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
    getAllPurchaseHistory
}