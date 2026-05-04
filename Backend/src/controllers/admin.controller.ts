// admin.controller.ts — COMPLETE FILE (replace existing)

import { Request, Response } from 'express';
import { User, UserRole } from '../models/User.model';
import { Product } from '../models/Product.model';
import { Event } from '../models/Event.model';
import { ExploreItem } from '../models/ExploreItem.model';
import { Post } from '../models/Post.model';
import { sendSuccess, sendError } from '../utils/response.utils';

// ─────────────────────────────────────────────────────────────
// GET /api/v1/admin/users
// Paginated user list with search + role filter
// ─────────────────────────────────────────────────────────────
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const page   = Math.max(1, parseInt(req.query.page  as string) || 1);
    const limit  = Math.min(100, parseInt(req.query.limit as string) || 20);
    const skip   = (page - 1) * limit;

    // Optional filters
    const search = req.query.search as string | undefined;
    const role   = req.query.role   as string | undefined;
    const status = req.query.status as string | undefined; // 'active' | 'banned'

    const filter: Record<string, any> = {};

    if (search) {
      filter.$or = [
        { name:  { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (role && ['USER', 'ARTISAN', 'BUSINESS_OWNER', 'ADMIN'].includes(role)) {
      filter.role = role;
    }

    if (status === 'active') filter.isActive = true;
    if (status === 'banned') filter.isActive = false;

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('name email avatar role isActive isVerified createdAt'),
      User.countDocuments(filter),
    ]);

    sendSuccess(res, {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

// ─────────────────────────────────────────────────────────────
// PATCH /api/v1/admin/user/ban/:id
// Ban a user (isActive: false)
// ─────────────────────────────────────────────────────────────
export const banUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) { sendError(res, 'User not found.', 404); return; }

    // Prevent banning another admin
    if (user.role === 'ADMIN') {
      sendError(res, 'Cannot ban an admin account.', 403);
      return;
    }

    if (!user.isActive) {
      sendSuccess(res, null, 'User is already banned.');
      return;
    }

    await User.findByIdAndUpdate(req.params.id, {
      isActive: false,
      $unset: { refreshToken: 1 }, // force logout
    });

    sendSuccess(res, null, 'User banned successfully.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

// ─────────────────────────────────────────────────────────────
// PATCH /api/v1/admin/user/unban/:id
// Unban a user (isActive: true)
// ─────────────────────────────────────────────────────────────
export const unbanUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) { sendError(res, 'User not found.', 404); return; }

    if (user.isActive) {
      sendSuccess(res, null, 'User is already active.');
      return;
    }

    await User.findByIdAndUpdate(req.params.id, { isActive: true });

    sendSuccess(res, null, 'User unbanned successfully.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

// ─────────────────────────────────────────────────────────────
// PATCH /api/v1/admin/user/role/:id
// Change user role — body: { role: 'ADMIN' | 'USER' | 'ARTISAN' | 'BUSINESS_OWNER' }
// ─────────────────────────────────────────────────────────────
export const changeUserRole = async (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    const validRoles: UserRole[] = ['USER', 'ARTISAN', 'BUSINESS_OWNER', 'ADMIN'];

    if (!role || !validRoles.includes(role)) {
      sendError(res, `Role must be one of: ${validRoles.join(', ')}.`, 400);
      return;
    }

    const user = await User.findById(req.params.id);
    if (!user) { sendError(res, 'User not found.', 404); return; }

    // Prevent self-demotion
    if (user._id.toString() === req.user!.id && role !== 'ADMIN') {
      sendError(res, 'You cannot change your own admin role.', 403);
      return;
    }

    if (user.role === role) {
      sendSuccess(res, null, `User already has the role: ${role}.`);
      return;
    }

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('name email role');

    sendSuccess(res, { user: updated }, `Role updated to ${role} successfully.`);
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE /api/v1/admin/user/:id
// Hard delete — use carefully
// ─────────────────────────────────────────────────────────────
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) { sendError(res, 'User not found.', 404); return; }

    if (user._id.toString() === req.user!.id) {
      sendError(res, 'You cannot delete your own account.', 403);
      return;
    }

    if (user.role === 'ADMIN') {
      sendError(res, 'Cannot delete another admin account.', 403);
      return;
    }

    await User.findByIdAndDelete(req.params.id);
    sendSuccess(res, null, 'User deleted successfully.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/v1/admin/stats
// Dashboard stats
// ─────────────────────────────────────────────────────────────
export const getStats = async (req: Request, res: Response) => {
  try {
    const [
      totalUsers,
      bannedUsers,
      totalProducts,
      totalEvents,
      totalExploreItems,
      totalPosts,
      recentUsers,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: false }),
      Product.countDocuments({ isActive: true }),
      Event.countDocuments({ isActive: true }),
      ExploreItem.countDocuments({ isActive: true }),
      Post.countDocuments(),
      User.find().sort({ createdAt: -1 }).limit(5).select('name email avatar createdAt role'),
    ]);

    sendSuccess(res, {
      totalUsers,
      bannedUsers,
      activeUsers: totalUsers - bannedUsers,
      totalProducts,
      totalEvents,
      totalExploreItems,
      totalPosts,
      recentUsers,
    });
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};