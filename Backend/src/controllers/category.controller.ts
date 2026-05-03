import { Request, Response, NextFunction } from 'express';
import slugify from 'slugify';
import { Category } from '../models/Category.model';
import { sendSuccess } from '../utils/response.utils';
import { AppError } from '../middleware/error.middleware';

// GET /api/v1/categories
export const getCategories = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    sendSuccess(res, categories);
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/categories/:slug
export const getCategoryBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const category = await Category.findOne({ slug: req.params.slug, isActive: true });
    if (!category) throw new AppError('Category not found.', 404);
    sendSuccess(res, category);
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/categories — admin only
export const createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const slug = slugify(req.body.name, { lower: true, strict: true });
    const category = await Category.create({ ...req.body, slug });
    sendSuccess(res, category, 'Category created.', 201);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/categories/:id — admin only
export const updateCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) throw new AppError('Category not found.', 404);
    sendSuccess(res, category, 'Category updated.');
  } catch (error) {
    next(error);
  }
};