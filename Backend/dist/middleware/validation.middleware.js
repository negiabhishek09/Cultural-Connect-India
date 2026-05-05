"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStateSchema = exports.addReviewSchema = exports.createBusinessSchema = exports.addCommentSchema = exports.createPostSchema = exports.updateOrderStatusSchema = exports.createOrderSchema = exports.updateCartSchema = exports.addToCartSchema = exports.changePasswordSchema = exports.updateProfileSchema = exports.refreshSchema = exports.loginSchema = exports.registerSchema = exports.validate = void 0;
const zod_1 = require("zod");
const response_utils_1 = require("../utils/response.utils");
const validate = (schema) => {
    return (req, res, next) => {
        var _a;
        if (!schema) {
            return (0, response_utils_1.sendError)(res, 'Schema not provided', 500, [
                { message: 'Validation schema is undefined' },
            ]);
        }
        try {
            const result = schema.safeParse(req.body);
            if (!result.success) {
                const errors = (((_a = result.error) === null || _a === void 0 ? void 0 : _a.issues) || []).map((e) => ({
                    field: e.path.join('.') || 'unknown',
                    message: e.message,
                }));
                return (0, response_utils_1.sendError)(res, 'Validation failed.', 422, errors);
            }
            req.body = result.data;
            next();
        }
        catch (error) {
            return (0, response_utils_1.sendError)(res, 'Validation middleware error', 500, [
                { message: error.message },
            ]);
        }
    };
};
exports.validate = validate;
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1),
});
exports.refreshSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1),
});
exports.updateProfileSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100).optional(),
    location: zod_1.z.string().optional(),
    bio: zod_1.z.string().max(500).optional(),
    avatar: zod_1.z.string().optional(),
});
exports.changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(1),
    newPassword: zod_1.z.string().min(8),
});
exports.addToCartSchema = zod_1.z.object({
    productId: zod_1.z.string().min(1),
    quantity: zod_1.z.number().int().min(1).optional().default(1),
});
exports.updateCartSchema = zod_1.z.object({
    quantity: zod_1.z.number().int().min(1),
});
exports.createOrderSchema = zod_1.z.object({
    address: zod_1.z.string().min(5),
    phone: zod_1.z.string().min(10).max(15),
    paymentMethod: zod_1.z.enum(['cod', 'upi', 'card']),
    notes: zod_1.z.string().optional(),
});
exports.updateOrderStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
});
exports.createPostSchema = zod_1.z.object({
    caption: zod_1.z.string().min(1).max(500),
    image: zod_1.z.string().optional(),
    video: zod_1.z.string().optional(), // ✅ NEW
    mediaType: zod_1.z.enum(['image', 'video']).optional(), // ✅ NEW
    location: zod_1.z.string().optional(),
    categoryId: zod_1.z.string().optional(),
});
exports.addCommentSchema = zod_1.z.object({
    content: zod_1.z.string().min(1).max(1000),
});
// ✅ FIX: Ye 3 schemas missing the — ab add kar diye
exports.createBusinessSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100),
    description: zod_1.z.string().min(10).max(1000).optional(),
    category: zod_1.z.string().optional(),
    location: zod_1.z.string().optional(),
    phone: zod_1.z.string().optional(),
    email: zod_1.z.string().email().optional(),
    website: zod_1.z.string().url().optional(),
});
exports.addReviewSchema = zod_1.z.object({
    rating: zod_1.z.number().min(1).max(5),
    comment: zod_1.z.string().min(1).max(500).optional(),
});
exports.createStateSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100),
    description: zod_1.z.string().optional(),
    capital: zod_1.z.string().optional(),
    region: zod_1.z.string().optional(),
    image: zod_1.z.string().optional(),
    famousFor: zod_1.z.array(zod_1.z.string()).optional(),
});
