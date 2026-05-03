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

// ✅ FIX: Ye dono schemas missing the — isliye comment/post kaam nahi kar raha tha
export const createPostSchema = z.object({
  caption: z.string().min(1).max(500),
  image: z.string().optional(),
  location: z.string().optional(),
  categoryId: z.string().optional(),
});

export const addCommentSchema = z.object({
  content: z.string().min(1).max(1000),
});