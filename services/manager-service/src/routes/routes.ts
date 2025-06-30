import { Router } from 'express';
import orderControlller from '../controllers/order.controller';
import dashboardController from '../controllers/dashboard.controller';
import purchaseHistoryController from '../controllers/purchase-history.controller';

const router = Router();

router.get(`/dashboard`, dashboardController.dashboardStatus)

// Creación de nueva órden
router.post('/orders', orderControlller.createOrder);
// Listado de órdenes
router.get(`/orders`, orderControlller.getAllOrders)

router.get(`/purchases`, purchaseHistoryController.getAllPurchaseHistory)

export default router;