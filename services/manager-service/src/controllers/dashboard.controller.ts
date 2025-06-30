import { RequestHandler } from "express";
import { AppDataSource } from '../data-source';
import { OrderBatch, OrderStatus } from '../entities/OrderBatch.entity';
import { CachedInventory } from "../entities/CachedInventory.entity";
import { cachedRecipes } from '../index';
import { PurchaseHistory } from '../entities/PurchaseHistory.entity';

const dashboardStatus: RequestHandler = async (req, res) => {
    try {
        const orderRepository = AppDataSource.getRepository(OrderBatch);
        const inventoryRepository = AppDataSource.getRepository(CachedInventory);
        const purchaseRepo = AppDataSource.getRepository(PurchaseHistory);

        // Ejecutamos todas las consultas en paralelo para máxima eficiencia
        const [orderStats, recentOrders, inventory, recentPurchases] = await Promise.all([
            // Consulta 1: Obtener contadores de órdenes
            orderRepository.query(
                `SELECT 
                    COUNT(*) FILTER (WHERE status = 'PENDING' OR status = 'PURCHASING_INGREDIENTS' OR status = 'PREPARING_DISHES') as "inProgress",
                    COUNT(*) FILTER (WHERE status = 'COMPLETED') as "completed",
                    SUM(quantity) FILTER (WHERE status = 'COMPLETED') AS "totalCompletedQuantity"
                FROM order_batches`
            ),
            // Consulta 2: Obtener las últimas 50 órdenes
            orderRepository.query(`
                SELECT * FROM order_batches
                ORDER BY 
                    CASE 
                    WHEN status = 'PENDING' THEN 1
                    WHEN status = 'PURCHASING_INGREDIENTS' THEN 2
                    WHEN status = 'PREPARING_DISHES' THEN 3
                    WHEN status = 'COMPLETED' THEN 4
                    ELSE 5
                    END,
                    "updatedAt" DESC
                LIMIT 50
            `),
            // Consulta 3: Obtener todo el inventario cacheado
            inventoryRepository.find({ order: { ingredientName: 'ASC' } }),
            purchaseRepo.find({ order: { purchasedAt: 'DESC' }, take: 50 })
        ]);

        const responseData = {
            stats: {
                ordersInProgress: parseInt(orderStats[0].inProgress) || 0,
                ordersCompleted: parseInt(orderStats[0].completed) || 0,
                dishesCompleted: parseInt(orderStats[0].totalCompletedQuantity) || 0,
            },
            recentOrders,
            inventory,
            recipes: cachedRecipes,
            recentPurchases
        };

        res.status(200).json({
            success: true,
            message: `Data retrieved successfully.`,
            data: responseData
        });


    } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        res.status(500).json({ message: 'Error fetching dashboard data' });
    }
}

export default {
    dashboardStatus
}