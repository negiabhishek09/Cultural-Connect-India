import { Router } from 'express';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from '../controllers/cart.controller';
import { protect } from '../middleware/auth.middleware';
import { validate, addToCartSchema, updateCartSchema } from '../middleware/validation.middleware';

const router = Router();
router.use(protect);
router.get('/',             getCart);
router.post('/',            validate(addToCartSchema),  addToCart);
router.patch('/:productId', validate(updateCartSchema), updateCartItem);
router.delete('/clear',     clearCart);
router.delete('/:productId', removeFromCart);
export default router;