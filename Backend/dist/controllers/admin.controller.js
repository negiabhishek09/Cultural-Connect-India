"use strict";
// admin.controller.ts — COMPLETE FILE (replace existing)
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
exports.getStats = exports.deleteUser = exports.changeUserRole = exports.unbanUser = exports.banUser = exports.getAllUsers = void 0;
const User_model_1 = require("../models/User.model");
const Product_model_1 = require("../models/Product.model");
const Event_model_1 = require("../models/Event.model");
const ExploreItem_model_1 = require("../models/ExploreItem.model");
const Post_model_1 = require("../models/Post.model");
const response_utils_1 = require("../utils/response.utils");
// ─────────────────────────────────────────────────────────────
// GET /api/v1/admin/users
// Paginated user list with search + role filter
// ─────────────────────────────────────────────────────────────
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, parseInt(req.query.limit) || 20);
        const skip = (page - 1) * limit;
        // Optional filters
        const search = req.query.search;
        const role = req.query.role;
        const status = req.query.status; // 'active' | 'banned'
        const filter = {};
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }
        if (role && ['USER', 'ARTISAN', 'BUSINESS_OWNER', 'ADMIN'].includes(role)) {
            filter.role = role;
        }
        if (status === 'active')
            filter.isActive = true;
        if (status === 'banned')
            filter.isActive = false;
        const [users, total] = yield Promise.all([
            User_model_1.User.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .select('name email avatar role isActive isVerified createdAt'),
            User_model_1.User.countDocuments(filter),
        ]);
        (0, response_utils_1.sendSuccess)(res, {
            users,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    }
    catch (err) {
        (0, response_utils_1.sendError)(res, err.message, 500);
    }
});
exports.getAllUsers = getAllUsers;
// ─────────────────────────────────────────────────────────────
// PATCH /api/v1/admin/user/ban/:id
// Ban a user (isActive: false)
// ─────────────────────────────────────────────────────────────
const banUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_model_1.User.findById(req.params.id);
        if (!user) {
            (0, response_utils_1.sendError)(res, 'User not found.', 404);
            return;
        }
        // Prevent banning another admin
        if (user.role === 'ADMIN') {
            (0, response_utils_1.sendError)(res, 'Cannot ban an admin account.', 403);
            return;
        }
        if (!user.isActive) {
            (0, response_utils_1.sendSuccess)(res, null, 'User is already banned.');
            return;
        }
        yield User_model_1.User.findByIdAndUpdate(req.params.id, {
            isActive: false,
            $unset: { refreshToken: 1 }, // force logout
        });
        (0, response_utils_1.sendSuccess)(res, null, 'User banned successfully.');
    }
    catch (err) {
        (0, response_utils_1.sendError)(res, err.message, 500);
    }
});
exports.banUser = banUser;
// ─────────────────────────────────────────────────────────────
// PATCH /api/v1/admin/user/unban/:id
// Unban a user (isActive: true)
// ─────────────────────────────────────────────────────────────
const unbanUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_model_1.User.findById(req.params.id);
        if (!user) {
            (0, response_utils_1.sendError)(res, 'User not found.', 404);
            return;
        }
        if (user.isActive) {
            (0, response_utils_1.sendSuccess)(res, null, 'User is already active.');
            return;
        }
        yield User_model_1.User.findByIdAndUpdate(req.params.id, { isActive: true });
        (0, response_utils_1.sendSuccess)(res, null, 'User unbanned successfully.');
    }
    catch (err) {
        (0, response_utils_1.sendError)(res, err.message, 500);
    }
});
exports.unbanUser = unbanUser;
// ─────────────────────────────────────────────────────────────
// PATCH /api/v1/admin/user/role/:id
// Change user role — body: { role: 'ADMIN' | 'USER' | 'ARTISAN' | 'BUSINESS_OWNER' }
// ─────────────────────────────────────────────────────────────
const changeUserRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { role } = req.body;
        const validRoles = ['USER', 'ARTISAN', 'BUSINESS_OWNER', 'ADMIN'];
        if (!role || !validRoles.includes(role)) {
            (0, response_utils_1.sendError)(res, `Role must be one of: ${validRoles.join(', ')}.`, 400);
            return;
        }
        const user = yield User_model_1.User.findById(req.params.id);
        if (!user) {
            (0, response_utils_1.sendError)(res, 'User not found.', 404);
            return;
        }
        // Prevent self-demotion
        if (user._id.toString() === req.user.id && role !== 'ADMIN') {
            (0, response_utils_1.sendError)(res, 'You cannot change your own admin role.', 403);
            return;
        }
        if (user.role === role) {
            (0, response_utils_1.sendSuccess)(res, null, `User already has the role: ${role}.`);
            return;
        }
        const updated = yield User_model_1.User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('name email role');
        (0, response_utils_1.sendSuccess)(res, { user: updated }, `Role updated to ${role} successfully.`);
    }
    catch (err) {
        (0, response_utils_1.sendError)(res, err.message, 500);
    }
});
exports.changeUserRole = changeUserRole;
// ─────────────────────────────────────────────────────────────
// DELETE /api/v1/admin/user/:id
// Hard delete — use carefully
// ─────────────────────────────────────────────────────────────
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_model_1.User.findById(req.params.id);
        if (!user) {
            (0, response_utils_1.sendError)(res, 'User not found.', 404);
            return;
        }
        if (user._id.toString() === req.user.id) {
            (0, response_utils_1.sendError)(res, 'You cannot delete your own account.', 403);
            return;
        }
        if (user.role === 'ADMIN') {
            (0, response_utils_1.sendError)(res, 'Cannot delete another admin account.', 403);
            return;
        }
        yield User_model_1.User.findByIdAndDelete(req.params.id);
        (0, response_utils_1.sendSuccess)(res, null, 'User deleted successfully.');
    }
    catch (err) {
        (0, response_utils_1.sendError)(res, err.message, 500);
    }
});
exports.deleteUser = deleteUser;
// ─────────────────────────────────────────────────────────────
// GET /api/v1/admin/stats
// Dashboard stats
// ─────────────────────────────────────────────────────────────
const getStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [totalUsers, bannedUsers, totalProducts, totalEvents, totalExploreItems, totalPosts, recentUsers,] = yield Promise.all([
            User_model_1.User.countDocuments(),
            User_model_1.User.countDocuments({ isActive: false }),
            Product_model_1.Product.countDocuments({ isActive: true }),
            Event_model_1.Event.countDocuments({ isActive: true }),
            ExploreItem_model_1.ExploreItem.countDocuments({ isActive: true }),
            Post_model_1.Post.countDocuments(),
            User_model_1.User.find().sort({ createdAt: -1 }).limit(5).select('name email avatar createdAt role'),
        ]);
        (0, response_utils_1.sendSuccess)(res, {
            totalUsers,
            bannedUsers,
            activeUsers: totalUsers - bannedUsers,
            totalProducts,
            totalEvents,
            totalExploreItems,
            totalPosts,
            recentUsers,
        });
    }
    catch (err) {
        (0, response_utils_1.sendError)(res, err.message, 500);
    }
});
exports.getStats = getStats;
