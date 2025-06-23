import { Router } from 'express';
import { createOrderController } from '../controllers/order.controller';

const router = Router();

router.post('/order', createOrderController);

export default router;