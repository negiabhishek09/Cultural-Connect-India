import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import { sendError } from '../utils/response.utils';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    if (!schema) {
      return sendError(res, 'Schema not provided', 500, [
        { message: 'Validation schema is undefined' },
      ]);
    }
    try {
      const result = schema.safeParse(req.body);
      if (!result.success) {
        const errors = (result.error?.issues || []).map((e) => ({
          field: e.path.join('.') || 'unknown',
          message: e.message,
        }));
        return sendError(res, 'Validation failed.', 422, errors);
      }
      req.body = result.data;
      next();
    } catch (error: any) {
      return sendError(res, 'Validation middleware error', 500, [
        { message: error.message },
      ]);
    }
  };
};

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  location: z.string().optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export const addToCartSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).optional().default(1),
});

export const updateCartSchema = z.object({
  quantity: z.number().int().min(1),
});

export const createOrderSchema = z.object({
  address: z.string().min(5),
  phone: z.string().min(10).max(15),
  paymentMethod: z.enum(['cod', 'upi', 'card']),
  notes: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
});

export const createPostSchema = z.object({
  caption: z.string().min(1).max(500),
  image: z.string().optional(),
  video: z.string().optional(),        // ✅ NEW
  mediaType: z.enum(['image', 'video']).optional(),  // ✅ NEW
  location: z.string().optional(),
  categoryId: z.string().optional(),
});
export const addCommentSchema = z.object({
  content: z.string().min(1).max(1000),
});

// ✅ FIX: Ye 3 schemas missing the — ab add kar diye
export const createBusinessSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().min(10).max(1000).optional(),
  category: z.string().optional(),
  location: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
});

export const addReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(1).max(500).optional(),
});

export const createStateSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().optional(),
  capital: z.string().optional(),
  region: z.string().optional(),
  image: z.string().optional(),
  famousFor: z.array(z.string()).optional(),
});