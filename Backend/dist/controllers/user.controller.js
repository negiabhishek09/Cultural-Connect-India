"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsers = exports.getSavedPosts = exports.getWishlist = exports.changePassword = exports.updateProfile = exports.getProfile = void 0;
const User_model_1 = require("../models/User.model");
const Post_model_1 = require("../models/Post.model");
const Product_model_1 = require("../models/Product.model");
const response_utils_1 = require("../utils/response.utils");
const error_middleware_1 = require("../middleware/error.middleware");
// GET /api/v1/users/profile
const getProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_model_1.User.findById(req.user.id);
        if (!user)
            throw new error_middleware_1.AppError('User not found.', 404);
        const [postCount, orderCount] = yield Promise.all([
            Post_model_1.Post.countDocuments({ userId: user._id, isActive: true }),
            Promise.resolve().then(() => __importStar(require('../models/Order.model'))).then(({ Order }) => Order.countDocuments({ userId: user._id })),
        ]);
        (0, response_utils_1.sendSuccess)(res, Object.assign(Object.assign({}, user.toJSON()), { stats: { posts: postCount, orders: orderCount } }));
    }
    catch (error) {
        next(error);
    }
});
exports.getProfile = getProfile;
// PATCH /api/v1/users/profile
const updateProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, bio, location, avatar } = req.body;
        const user = yield User_model_1.User.findByIdAndUpdate(req.user.id, { name, bio, location, avatar }, { new: true, runValidators: true });
        if (!user)
            throw new error_middleware_1.AppError('User not found.', 404);
        (0, response_utils_1.sendSuccess)(res, user, 'Profile updated.');
    }
    catch (error) {
        next(error);
    }
});
exports.updateProfile = updateProfile;
// PATCH /api/v1/users/change-password
const changePassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = yield User_model_1.User.findById(req.user.id).select('+password');
        if (!user)
            throw new error_middleware_1.AppError('User not found.', 404);
        const isMatch = yield user.comparePassword(currentPassword);
        if (!isMatch)
            throw new error_middleware_1.AppError('Current password is incorrect.', 400); // ✅ Fix: user -> !isMatch
        user.password = newPassword;
        yield user.save();
        (0, response_utils_1.sendSuccess)(res, null, 'Password changed successfully.');
    }
    catch (error) {
        next(error);
    }
});
exports.changePassword = changePassword;
// GET /api/v1/users/wishlist
const getWishlist = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, limit, skip } = (0, response_utils_1.parsePagination)(req.query);
        const user = yield User_model_1.User.findById(req.user.id).select('wishlist');
        // ✅ Fix: any use karke type error avoid kiya
        const wishlistIds = Array.isArray(user === null || user === void 0 ? void 0 : user.wishlist)
            ? user.wishlist
            : [];
        const total = wishlistIds.length;
        const pageIds = wishlistIds.slice(skip, skip + limit);
        const products = yield Product_model_1.Product.find({ _id: { $in: pageIds }, isActive: true })
            .populate('businessId', 'name isVerified');
        (0, response_utils_1.sendPaginated)(res, products, { page, limit, total, totalPages: Math.ceil(total / limit) });
    }
    catch (error) {
        next(error);
    }
});
exports.getWishlist = getWishlist;
// GET /api/v1/users/saved-posts
const getSavedPosts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, limit, skip } = (0, response_utils_1.parsePagination)(req.query);
        const [posts, total] = yield Promise.all([
            Post_model_1.Post.find({ savedBy: req.user.id, isActive: true })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('userId', 'name avatar location'),
            Post_model_1.Post.countDocuments({ savedBy: req.user.id, isActive: true }),
        ]);
        const enriched = posts.map((post) => (Object.assign(Object.assign({}, post.toJSON()), { likeCount: post.likes.length, commentCount: post.comments.length, isSaved: true })));
        (0, response_utils_1.sendPaginated)(res, enriched, { page, limit, total, totalPages: Math.ceil(total / limit) });
    }
    catch (error) {
        next(error);
    }
});
exports.getSavedPosts = getSavedPosts;
// GET /api/v1/users — admin only
const getAllUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, limit, skip } = (0, response_utils_1.parsePagination)(req.query);
        const { role, search } = req.query;
        const filter = {};
        if (role)
            filter.role = role;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }
        const [users, total] = yield Promise.all([
            User_model_1.User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
            User_model_1.User.countDocuments(filter),
        ]);
        (0, response_utils_1.sendPaginated)(res, users, { page, limit, total, totalPages: Math.ceil(total / limit) });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllUsers = getAllUsers;
