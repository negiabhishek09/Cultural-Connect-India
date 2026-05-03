import { Router } from 'express';
import { createOrder, getMyOrders, getOrderById, updateOrderStatus } from '../controllers/order.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { validate, createOrderSchema, updateOrderStatusSchema } from '../middleware/validation.middleware';

const router = Router();
router.use(protect);
router.post('/',   validate(createOrderSchema), createOrder);
router.get('/',    getMyOrders);
router.get('/:id', getOrderById);
router.patch('/:id/status', restrictTo('ADMIN'), validate(updateOrderStatusSchema), updateOrderStatus);
export default router;