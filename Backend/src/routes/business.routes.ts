import { Router } from 'express';
import { getBusinesses, getBusinessBySlug, createBusiness, updateBusiness, addReview } from '../controllers/business.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { validate, createBusinessSchema, addReviewSchema } from '../middleware/validation.middleware';

const router = Router();
router.get('/',           getBusinesses);
router.get('/:slug',      getBusinessBySlug);
router.post('/',          protect, restrictTo('BUSINESS_OWNER', 'ADMIN'), validate(createBusinessSchema), createBusiness);
router.patch('/:id',      protect, updateBusiness);
router.post('/:id/reviews', protect, validate(addReviewSchema), addReview);
export default router;