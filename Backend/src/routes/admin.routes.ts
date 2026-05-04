// admin.routes.ts — COMPLETE FILE (replace existing)

import express from 'express';
import { protect, restrictTo } from '../middleware/auth.middleware';
import {
  getAllUsers,
  banUser,
  unbanUser,
  changeUserRole,
  deleteUser,
  getStats,
} from '../controllers/admin.controller';

const router = express.Router();

// All admin routes require auth + ADMIN role
router.use(protect, restrictTo('ADMIN'));

// Stats
router.get('/stats', getStats);

// User management
router.get('/users', getAllUsers);                        // ?page=1&limit=20&search=john&role=USER&status=active
router.patch('/user/ban/:id',    banUser);
router.patch('/user/unban/:id',  unbanUser);
router.patch('/user/role/:id',   changeUserRole);        // body: { role: 'ADMIN' }
router.delete('/user/:id',       deleteUser);

export default router;