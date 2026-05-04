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
exports.updateOrderStatus = exports.getOrderById = exports.getMyOrders = exports.createOrder = void 0;
const Order_model_1 = require("../models/Order.model");
const Cart_model_1 = require("../models/Cart.model");
const Product_model_1 = require("../models/Product.model");
const User_model_1 = require("../models/User.model");
const response_utils_1 = require("../utils/response.utils");
const error_middleware_1 = require("../middleware/error.middleware");
// ✅ FIX: ../services/email.service → ../utils/email (sahi path)
const email_1 = require("../utils/email");
// POST /api/v1/orders
const createOrder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { address, phone, notes } = req.body;
        const userId = req.user.id;
        const cart = yield Cart_model_1.Cart.findOne({ userId }).populate('items.productId');
        if (!cart || cart.items.length === 0) {
            (0, response_utils_1.sendError)(res, 'Your cart is empty.', 400);
            return;
        }
        // Stock validate karo
        for (const item of cart.items) {
            const product = item.productId;
            if (!product || !product.isActive) {
                (0, response_utils_1.sendError)(res, `Product "${product === null || product === void 0 ? void 0 : product.name}" is no longer available.`, 400);
                return;
            }
            if (product.stock < item.quantity) {
                (0, response_utils_1.sendError)(res, `Insufficient stock for "${product.name}". Available: ${product.stock}`, 400);
                return;
            }
        }
        const orderItems = cart.items.map((item) => {
            const product = item.productId;
            return {
                productId: product._id,
                name: product.name,
                image: product.image,
                price: product.price,
                quantity: item.quantity,
            };
        });
        const totalAmount = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
        const order = yield Order_model_1.Order.create({
            userId,
            items: orderItems,
            totalAmount,
            address,
            phone,
            notes,
        });
        // Stock decrement karo
        yield Promise.all(cart.items.map((item) => {
            const product = item.productId;
            return Product_model_1.Product.findByIdAndUpdate(product._id, {
                $inc: { stock: -item.quantity, soldCount: item.quantity },
            });
        }));
        // Cart clear karo
        yield Cart_model_1.Cart.findOneAndUpdate({ userId }, { $set: { items: [] } });
        (0, response_utils_1.sendSuccess)(res, order, 'Order placed successfully.', 201);
        // ✅ Email bhejo — sahi import path se
        const user = yield User_model_1.User.findById(userId).select('name email');
        if (user)
            (0, email_1.sendOrderConfirmationEmail)(user.name, user.email, order._id.toString(), totalAmount);
    }
    catch (error) {
        next(error);
    }
});
exports.createOrder = createOrder;
// GET /api/v1/orders
const getMyOrders = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, limit, skip } = (0, response_utils_1.parsePagination)(req.query);
        const [orders, total] = yield Promise.all([
            Order_model_1.Order.find({ userId: req.user.id })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Order_model_1.Order.countDocuments({ userId: req.user.id }),
        ]);
        (0, response_utils_1.sendPaginated)(res, orders, { page, limit, total, totalPages: Math.ceil(total / limit) });
    }
    catch (error) {
        next(error);
    }
});
exports.getMyOrders = getMyOrders;
// GET /api/v1/orders/:id
const getOrderById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const order = yield Order_model_1.Order.findById(req.params.id).populate('userId', 'name email');
        if (!order)
            throw new error_middleware_1.AppError('Order not found.', 404);
        if (order.userId._id.toString() !== req.user.id && req.user.role !== 'ADMIN') {
            throw new error_middleware_1.AppError('Access denied.', 403);
        }
        (0, response_utils_1.sendSuccess)(res, order);
    }
    catch (error) {
        next(error);
    }
});
exports.getOrderById = getOrderById;
// PATCH /api/v1/orders/:id/status — admin only
const updateOrderStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const order = yield Order_model_1.Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
        if (!order)
            throw new error_middleware_1.AppError('Order not found.', 404);
        (0, response_utils_1.sendSuccess)(res, order, `Order status updated to ${order.status}.`);
    }
    catch (error) {
        next(error);
    }
});
exports.updateOrderStatus = updateOrderStatus;
