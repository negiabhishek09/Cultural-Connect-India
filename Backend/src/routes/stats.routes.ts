import { Router } from 'express';
import { getPublicStats, getAdminStats } from '../controllers/stats.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();
router.get('/public', getPublicStats);
router.get('/admin',  protect, restrictTo('ADMIN'), getAdminStats);
export default router;