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
exports.clearCart = exports.removeFromCart = exports.updateCartItem = exports.addToCart = exports.getCart = void 0;
const Cart_model_1 = require("../models/Cart.model");
const Product_model_1 = require("../models/Product.model");
const response_utils_1 = require("../utils/response.utils");
const error_middleware_1 = require("../middleware/error.middleware");
// GET /api/v1/cart
const getCart = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cart = yield Cart_model_1.Cart.findOne({ userId: req.user.id }).populate('items.productId', 'name slug image price originalPrice stock isActive');
        if (!cart || cart.items.length === 0) {
            (0, response_utils_1.sendSuccess)(res, { items: [], subtotal: 0, itemCount: 0 });
            return;
        }
        let subtotal = 0;
        let itemCount = 0;
        const items = cart.items.map((item) => {
            const product = item.productId;
            subtotal += product.price * item.quantity;
            itemCount += item.quantity;
            return { product, quantity: item.quantity };
        });
        (0, response_utils_1.sendSuccess)(res, { items, subtotal, itemCount });
    }
    catch (error) {
        next(error);
    }
});
exports.getCart = getCart;
// POST /api/v1/cart
const addToCart = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { productId, quantity = 1 } = req.body;
        const product = yield Product_model_1.Product.findById(productId);
        if (!product || !product.isActive)
            throw new error_middleware_1.AppError('Product not found.', 404);
        if (product.stock < quantity) {
            (0, response_utils_1.sendError)(res, `Only ${product.stock} units available.`, 400);
            return;
        }
        let cart = yield Cart_model_1.Cart.findOne({ userId: req.user.id });
        if (!cart) {
            // First item — create cart
            cart = yield Cart_model_1.Cart.create({
                userId: req.user.id,
                items: [{ productId, quantity }],
            });
        }
        else {
            const existingIndex = cart.items.findIndex((i) => i.productId.toString() === productId);
            if (existingIndex > -1) {
                const newQty = cart.items[existingIndex].quantity + quantity;
                if (newQty > product.stock) {
                    (0, response_utils_1.sendError)(res, `Cannot add more. Only ${product.stock} units available.`, 400);
                    return;
                }
                cart.items[existingIndex].quantity = newQty;
            }
            else {
                cart.items.push({ productId, quantity });
            }
            yield cart.save();
        }
        yield cart.populate('items.productId', 'name slug image price originalPrice stock');
        (0, response_utils_1.sendSuccess)(res, cart, 'Item added to cart.', 201);
    }
    catch (error) {
        next(error);
    }
});
exports.addToCart = addToCart;
// PATCH /api/v1/cart/:productId
const updateCartItem = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { quantity } = req.body;
        const { productId } = req.params;
        if (quantity < 1) {
            (0, response_utils_1.sendError)(res, 'Quantity must be at least 1. Use DELETE to remove.', 400);
            return;
        }
        const product = yield Product_model_1.Product.findById(productId);
        if (!product)
            throw new error_middleware_1.AppError('Product not found.', 404);
        if (quantity > product.stock) {
            (0, response_utils_1.sendError)(res, `Only ${product.stock} units available.`, 400);
            return;
        }
        const cart = yield Cart_model_1.Cart.findOneAndUpdate({ userId: req.user.id, 'items.productId': productId }, { $set: { 'items.$.quantity': quantity } }, { new: true }).populate('items.productId', 'name slug image price originalPrice stock');
        if (!cart)
            throw new error_middleware_1.AppError('Item not found in cart.', 404);
        (0, response_utils_1.sendSuccess)(res, cart, 'Cart updated.');
    }
    catch (error) {
        next(error);
    }
});
exports.updateCartItem = updateCartItem;
// DELETE /api/v1/cart/:productId
const removeFromCart = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cart = yield Cart_model_1.Cart.findOneAndUpdate({ userId: req.user.id }, { $pull: { items: { productId: req.params.productId } } }, { new: true }).populate('items.productId', 'name slug image price originalPrice stock');
        if (!cart)
            throw new error_middleware_1.AppError('Cart not found.', 404);
        (0, response_utils_1.sendSuccess)(res, cart, 'Item removed from cart.');
    }
    catch (error) {
        next(error);
    }
});
exports.removeFromCart = removeFromCart;
// DELETE /api/v1/cart
const clearCart = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield Cart_model_1.Cart.findOneAndUpdate({ userId: req.user.id }, { $set: { items: [] } });
        (0, response_utils_1.sendSuccess)(res, null, 'Cart cleared.');
    }
    catch (error) {
        next(error);
    }
});
exports.clearCart = clearCart;
