import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Post } from '../models/Post.model';
import { sendSuccess, sendPaginated, parsePagination } from '../utils/response.utils';
import { AppError } from '../middleware/error.middleware';

// GET /api/v1/posts
export const getPosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit, skip } = parsePagination(req.query as Record<string, unknown>);
    const { categoryId } = req.query;

    const filter: Record<string, unknown> = { isActive: true };
    if (categoryId) filter.categoryId = categoryId;

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name avatar location')
        .populate('categoryId', 'name slug'),
      Post.countDocuments(filter),
    ]);

    const userId = req.user?.id;
    const enriched = posts.map((post) => {
      // ✅ Fix: unknown pehle, phir Record<string, unknown>
      const obj = post.toJSON() as unknown as Record<string, unknown>;
      obj.likeCount = (post.likes as mongoose.Types.ObjectId[]).length;
      obj.commentCount = post.comments.length;
      obj.isLiked = userId
        ? post.likes.some((id) => id.toString() === userId)
        : false;
      obj.isSaved = userId
        ? post.savedBy.some((id) => id.toString() === userId)
        : false;
      delete obj.likes;
      delete obj.savedBy;
      return obj;
    });

    sendPaginated(res, enriched, { page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/posts/liked
export const getLikedPosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user!.id);
    const { page, limit, skip } = parsePagination(req.query as Record<string, unknown>);

    const [posts, total] = await Promise.all([
      Post.find({ likes: userId, isActive: true })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name avatar location')
        .populate('categoryId', 'name slug'),
      Post.countDocuments({ likes: userId, isActive: true }),
    ]);

    const enriched = posts.map((post) => {
      // ✅ Fix: unknown pehle, phir Record<string, unknown>
      const obj = post.toJSON() as unknown as Record<string, unknown>;
      obj.likeCount = (post.likes as mongoose.Types.ObjectId[]).length;
      obj.commentCount = post.comments.length;
      obj.isLiked = true;
      obj.isSaved = post.savedBy.some((id) => id.toString() === req.user!.id);
      delete obj.likes;
      delete obj.savedBy;
      return obj;
    });

    sendPaginated(res, enriched, { page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/posts
export const createPost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const post = await Post.create({
      ...req.body,
      userId: req.user!.id,
    });
    const populated = await post.populate('userId', 'name avatar location');
    sendSuccess(res, populated, 'Post created successfully.', 201);
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/posts/:id/like — toggle
export const toggleLike = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || !post.isActive) throw new AppError('Post not found.', 404);

    const userId = new mongoose.Types.ObjectId(req.user!.id);
    const alreadyLiked = post.likes.some((id) => id.toString() === userId.toString());

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId.toString()) as mongoose.Types.ObjectId[];
      await post.save();
      sendSuccess(res, { liked: false, likeCount: post.likes.length }, 'Post unliked.');
    } else {
      post.likes.push(userId);
      await post.save();
      sendSuccess(res, { liked: true, likeCount: post.likes.length }, 'Post liked.');
    }
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/posts/:id/save — toggle bookmark
export const toggleSave = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || !post.isActive) throw new AppError('Post not found.', 404);

    const userId = new mongoose.Types.ObjectId(req.user!.id);
    const alreadySaved = post.savedBy.some((id) => id.toString() === userId.toString());

    if (alreadySaved) {
      post.savedBy = post.savedBy.filter((id) => id.toString() !== userId.toString()) as mongoose.Types.ObjectId[];
      await post.save();
      sendSuccess(res, { saved: false }, 'Post unsaved.');
    } else {
      post.savedBy.push(userId);
      await post.save();
      sendSuccess(res, { saved: true }, 'Post saved.');
    }
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/posts/:id/comments
export const getComments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit, skip } = parsePagination(req.query as Record<string, unknown>);

    const post = await Post.findById(req.params.id)
      .select('comments')
      .populate('comments.userId', 'name avatar');

    if (!post) throw new AppError('Post not found.', 404);

    const allComments = post.comments;
    const total = allComments.length;
    const paginated = allComments.slice(skip, skip + limit);

    sendPaginated(res, paginated, { page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/posts/:id/comments
export const addComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || !post.isActive) throw new AppError('Post not found.', 404);

    post.comments.push({
      userId: new mongoose.Types.ObjectId(req.user!.id),
      content: req.body.content,
      createdAt: new Date(),
    } as never);

    await post.save();
    await post.populate('comments.userId', 'name avatar');

    const newComment = post.comments[post.comments.length - 1];
    sendSuccess(res, newComment, 'Comment added.', 201);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/posts/:id
export const deletePost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) throw new AppError('Post not found.', 404);

    if (post.userId.toString() !== req.user!.id && req.user!.role !== 'ADMIN') {
      throw new AppError('You can only delete your own posts.', 403);
    }

    post.isActive = false;
    await post.save();
    sendSuccess(res, null, 'Post deleted successfully.');
  } catch (error) {
    next(error);
  }
};