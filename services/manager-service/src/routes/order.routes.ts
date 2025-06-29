import { Router } from 'express';
import orderControlller from '../controllers/order.controller';
import dashboardController from '../controllers/dashboard.controller';

const router = Router();

router.get(`/dashboard`, dashboardController.dashboardStatus)

// Creación de nueva órden
router.post('/orders', orderControlller.createOrder);
// Listado de órdenes
router.get(`/orders`, orderControlller.getAllOrders)

export default router;