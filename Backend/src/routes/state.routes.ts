import { Router } from 'express';
import { getStates, getStateBySlug, createState, updateState } from '../controllers/state.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { validate, createStateSchema } from '../middleware/validation.middleware';

const router = Router();
router.get('/',      getStates);
router.get('/:slug', getStateBySlug);
router.post('/',     protect, restrictTo('ADMIN'), validate(createStateSchema), createState);
router.patch('/:id', protect, restrictTo('ADMIN'), updateState);
export default router;