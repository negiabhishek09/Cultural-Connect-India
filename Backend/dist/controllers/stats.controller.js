"use strict";
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
exports.getAdminStats = exports.getPublicStats = void 0;
const User_model_1 = require("../models/User.model");
const Event_model_1 = require("../models/Event.model");
const Business_model_1 = require("../models/Business.model");
const Product_model_1 = require("../models/Product.model");
const Post_model_1 = require("../models/Post.model");
const Order_model_1 = require("../models/Order.model");
const Category_model_1 = require("../models/Category.model");
const State_model_1 = require("../models/State.model");
const response_utils_1 = require("../utils/response.utils");
// GET /api/v1/stats/public — powers Hero & About section counters
const getPublicStats = (_req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [states, events, artisans, businesses, products, categories, posts] = yield Promise.all([
            State_model_1.State.countDocuments({ isActive: true }),
            Event_model_1.Event.countDocuments({ isActive: true }),
            User_model_1.User.countDocuments({ role: { $in: ['ARTISAN', 'BUSINESS_OWNER'] }, isActive: true }),
            Business_model_1.Business.countDocuments({ isActive: true, isVerified: true }),
            Product_model_1.Product.countDocuments({ isActive: true }),
            Category_model_1.Category.countDocuments({ isActive: true }),
            Post_model_1.Post.countDocuments({ isActive: true }),
        ]);
        (0, response_utils_1.sendSuccess)(res, {
            states,
            events,
            artisans,
            businesses,
            products,
            categories,
            communityPosts: posts,
            languages: 22, // 22 scheduled languages of India — static fact
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getPublicStats = getPublicStats;
// GET /api/v1/stats/admin — dashboard analytics (admin only)
const getAdminStats = (_req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const [totalUsers, newUsersThisMonth, totalOrders, ordersThisMonth, revenueAgg, revenueThisMonthAgg, pendingOrders, totalBusinesses, unverifiedBusinesses, topProducts, recentOrders, ordersByStatus,] = yield Promise.all([
            User_model_1.User.countDocuments(),
            User_model_1.User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
            Order_model_1.Order.countDocuments(),
            Order_model_1.Order.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
            Order_model_1.Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
            Order_model_1.Order.aggregate([
                { $match: { createdAt: { $gte: thirtyDaysAgo } } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } },
            ]),
            Order_model_1.Order.countDocuments({ status: 'PENDING' }),
            Business_model_1.Business.countDocuments(),
            Business_model_1.Business.countDocuments({ isVerified: false }),
            Product_model_1.Product.find({ isActive: true })
                .sort({ soldCount: -1 })
                .limit(5)
                .select('name image price soldCount rating'),
            Order_model_1.Order.find()
                .sort({ createdAt: -1 })
                .limit(10)
                .populate('userId', 'name email'),
            // Aggregate order counts by status
            Order_model_1.Order.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } },
                { $sort: { _id: 1 } },
            ]),
        ]);
        (0, response_utils_1.sendSuccess)(res, {
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
                total: (_b = (_a = revenueAgg[0]) === null || _a === void 0 ? void 0 : _a.total) !== null && _b !== void 0 ? _b : 0,
                thisMonth: (_d = (_c = revenueThisMonthAgg[0]) === null || _c === void 0 ? void 0 : _c.total) !== null && _d !== void 0 ? _d : 0,
            },
            businesses: {
                total: totalBusinesses,
                awaitingVerification: unverifiedBusinesses,
            },
            topProducts,
            recentOrders,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAdminStats = getAdminStats;
