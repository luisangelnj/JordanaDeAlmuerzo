import { RequestHandler } from "express";
import { sendToQueue } from "../services/rabbitmq.service";
import { AppDataSource } from '../data-source';
import { OrderBatch, OrderStatus } from '../entities/OrderBatch.entity';

const dashboardStatus: RequestHandler = async (req, res) => {
    const orderRepo = AppDataSource.getRepository(OrderBatch);
    // const inventoryRepo = AppDataSource.getRepository(CachedInventory);

}