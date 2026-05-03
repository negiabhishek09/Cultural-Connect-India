import { Router } from 'express';
import {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  toggleWishlist,
} from '../controllers/product.controller';
import { protect, restrictTo, optionalAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/',          optionalAuth, getProducts);
router.get('/:slug',     optionalAuth, getProductBySlug);
router.post('/',         protect, restrictTo('ADMIN'), createProduct);
router.patch('/:id',     protect, restrictTo('ADMIN', 'BUSINESS_OWNER'), updateProduct);
router.post('/:id/wishlist', protect, toggleWishlist);

export default router;