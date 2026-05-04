import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.model';
import { Event } from '../models/Event.model';
import { Business } from '../models/Business.model';
import { Product } from '../models/Product.model';
import { Post } from '../models/Post.model';
import { Order } from '../models/Order.model';
import { Category } from '../models/Category.model';
import { State } from '../models/State.model';
import { sendSuccess } from '../utils/response.utils';

// GET /api/v1/stats/public — powers Hero & About section counters
export const getPublicStats = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [states, events, artisans, businesses, products, categories, posts] = await Promise.all([
      State.countDocuments({ isActive: true }),
      Event.countDocuments({ isActive: true }),
      User.countDocuments({ role: { $in: ['ARTISAN', 'BUSINESS_OWNER'] }, isActive: true }),
      Business.countDocuments({ isActive: true, isVerified: true }),
      Product.countDocuments({ isActive: true }),
      Category.countDocuments({ isActive: true }),
      Post.countDocuments({ isActive: true }),
    ]);

    sendSuccess(res, {
      states,
      events,
      artisans,
      businesses,
      products,
      categories,
      communityPosts: posts,
      languages: 22, // 22 scheduled languages of India — static fact
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/stats/admin — dashboard analytics (admin only)
export const getAdminStats = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalUsers,
      newUsersThisMonth,
      totalOrders,
      ordersThisMonth,
      revenueAgg,
      revenueThisMonthAgg,
      pendingOrders,
      totalBusinesses,
      unverifiedBusinesses,
      topProducts,
      recentOrders,
      ordersByStatus,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Order.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Order.countDocuments({ status: 'PENDING' }),
      Business.countDocuments(),
      Business.countDocuments({ isVerified: false }),
      Product.find({ isActive: true })
        .sort({ soldCount: -1 })
        .limit(5)
        .select('name image price soldCount rating'),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('userId', 'name email'),
      // Aggregate order counts by status
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    sendSuccess(res, {
      users: {
        total: totalUsers,
        newThisMonth: newUsersThisMonth,
      },
      orders: {
        total: totalOrders,
        thisMonth: ordersThisMonth,
        pending: pendingOrders,
        byStatus: ordersByStatus.map((s) => ({ status: s._id, count: s.count })),
      },
      revenue: {
        total: revenueAgg[0]?.total ?? 0,
        thisMonth: revenueThisMonthAgg[0]?.total ?? 0,
      },
      businesses: {
        total: totalBusinesses,
        awaitingVerification: unverifiedBusinesses,
      },
      topProducts,
      recentOrders,
    });
  } catch (error) {
    next(error);
  }
};