import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.model';
import { Post } from '../models/Post.model';
import { Product } from '../models/Product.model';
import { sendSuccess, sendPaginated, parsePagination } from '../utils/response.utils';
import { AppError } from '../middleware/error.middleware';

// GET /api/v1/users/profile
export const getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) throw new AppError('User not found.', 404);

    const [postCount, orderCount] = await Promise.all([
      Post.countDocuments({ userId: user._id, isActive: true }),
      import('../models/Order.model').then(({ Order }) =>
        Order.countDocuments({ userId: user._id })
      ),
    ]);

    sendSuccess(res, { ...user.toJSON(), stats: { posts: postCount, orders: orderCount } });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/users/profile
export const updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, bio, location, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user!.id,
      { name, bio, location, avatar },
      { new: true, runValidators: true }
    );
    if (!user) throw new AppError('User not found.', 404);
    sendSuccess(res, user, 'Profile updated.');
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/users/change-password
export const changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user!.id).select('+password');
    if (!user) throw new AppError('User not found.', 404);

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) throw new AppError('Current password is incorrect.', 400); // ✅ Fix: user -> !isMatch

    user.password = newPassword;
    await user.save();

    sendSuccess(res, null, 'Password changed successfully.');
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/users/wishlist
export const getWishlist = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit, skip } = parsePagination(req.query as Record<string, unknown>);

    const user = await User.findById(req.user!.id).select('wishlist');
    // ✅ Fix: any use karke type error avoid kiya
    const wishlistIds: string[] = Array.isArray((user as any)?.wishlist)
      ? (user as any).wishlist
      : [];

    const total = wishlistIds.length;
    const pageIds = wishlistIds.slice(skip, skip + limit);

    const products = await Product.find({ _id: { $in: pageIds }, isActive: true })
      .populate('businessId', 'name isVerified');

    sendPaginated(res, products, { page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/users/saved-posts
export const getSavedPosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit, skip } = parsePagination(req.query as Record<string, unknown>);

    const [posts, total] = await Promise.all([
      Post.find({ savedBy: req.user!.id, isActive: true })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name avatar location'),
      Post.countDocuments({ savedBy: req.user!.id, isActive: true }),
    ]);

    const enriched = posts.map((post) => ({
      ...post.toJSON(),
      likeCount: post.likes.length,
      commentCount: post.comments.length,
      isSaved: true,
    }));

    sendPaginated(res, enriched, { page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/users — admin only
export const getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit, skip } = parsePagination(req.query as Record<string, unknown>);
    const { role, search } = req.query;

    const filter: Record<string, unknown> = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    sendPaginated(res, users, { page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};