import { Router } from 'express';
import orderControlller from '../controllers/order.controller';


const router = Router();

// Creación de nueva órden
router.post('/orders', orderControlller.createOrder);

// Listado de órdenes
router.get(`/orders`, orderControlller.getAllOrders)

export default router;