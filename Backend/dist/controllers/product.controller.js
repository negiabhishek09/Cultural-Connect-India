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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleWishlist = exports.updateProduct = exports.createProduct = exports.getProductBySlug = exports.getProducts = void 0;
const slugify_1 = __importDefault(require("slugify"));
const Product_model_1 = require("../models/Product.model");
const User_model_1 = require("../models/User.model");
const Business_model_1 = require("../models/Business.model");
const response_utils_1 = require("../utils/response.utils");
const error_middleware_1 = require("../middleware/error.middleware");
// GET /api/v1/products
const getProducts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { page, limit, skip } = (0, response_utils_1.parsePagination)(req.query);
        const { categoryId, businessId, featured, search, minPrice, maxPrice, sortBy } = req.query;
        const filter = { isActive: true };
        if (categoryId)
            filter.categoryId = categoryId;
        if (businessId)
            filter.businessId = businessId;
        if (featured === 'true')
            filter.isFeatured = true;
        if (search)
            filter.name = { $regex: search, $options: 'i' };
        if (minPrice || maxPrice) {
            filter.price = Object.assign(Object.assign({}, (minPrice ? { $gte: Number(minPrice) } : {})), (maxPrice ? { $lte: Number(maxPrice) } : {}));
        }
        const sortMap = {
            price_asc: { price: 1 },
            price_desc: { price: -1 },
            rating: { rating: -1 },
            popular: { soldCount: -1 },
        };
        const sort = (_a = sortMap[sortBy]) !== null && _a !== void 0 ? _a : { isFeatured: -1, soldCount: -1 };
        const [products, total] = yield Promise.all([
            Product_model_1.Product.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .populate('businessId', 'name slug isVerified location')
                .populate('categoryId', 'name slug'),
            Product_model_1.Product.countDocuments(filter),
        ]);
        let wishlistIds = [];
        if (req.user) {
            const user = yield User_model_1.User.findById(req.user.id).select('wishlist');
            if (user && Array.isArray(user.wishlist)) {
                wishlistIds = user.wishlist;
            }
        }
        const enriched = products.map((p) => (Object.assign(Object.assign({}, p.toJSON()), { isWishlisted: Array.isArray(wishlistIds)
                ? wishlistIds.includes(p._id.toString())
                : false })));
        (0, response_utils_1.sendPaginated)(res, enriched, { page, limit, total, totalPages: Math.ceil(total / limit) });
    }
    catch (error) {
        next(error);
    }
});
exports.getProducts = getProducts;
// GET /api/v1/products/:slug
const getProductBySlug = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield Product_model_1.Product.findOne({ slug: req.params.slug, isActive: true })
            .populate('businessId', 'name slug isVerified location rating reviewCount')
            .populate('categoryId');
        if (!product)
            throw new error_middleware_1.AppError('Product not found.', 404);
        (0, response_utils_1.sendSuccess)(res, product);
    }
    catch (error) {
        next(error);
    }
});
exports.getProductBySlug = getProductBySlug;
// POST /api/v1/products
const createProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.user.role !== 'ADMIN') {
            const business = yield Business_model_1.Business.findById(req.body.businessId);
            if (!business || business.ownerId.toString() !== req.user.id) {
                throw new error_middleware_1.AppError('You can only add products to your own business.', 403);
            }
        }
        if (req.body.price !== undefined) {
            req.body.price = parseFloat(String(req.body.price).replace(/[^\d.]/g, ''));
        }
        const slug = `${(0, slugify_1.default)(req.body.name, { lower: true, strict: true })}-${Date.now()}`;
        const product = yield Product_model_1.Product.create(Object.assign(Object.assign({}, req.body), { slug }));
        (0, response_utils_1.sendSuccess)(res, product, 'Product created successfully.', 201);
    }
    catch (error) {
        next(error);
    }
});
exports.createProduct = createProduct;
// PATCH /api/v1/products/:id
const updateProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield Product_model_1.Product.findById(req.params.id).populate('businessId', 'ownerId');
        if (!product)
            throw new error_middleware_1.AppError('Product not found.', 404);
        const business = product.businessId;
        if (req.user.role !== 'ADMIN' && business.ownerId.toString() !== req.user.id) {
            throw new error_middleware_1.AppError('You can only update your own products.', 403);
        }
        delete req.body.slug;
        delete req.body.businessId;
        if (req.body.price !== undefined) {
            req.body.price = parseFloat(String(req.body.price).replace(/[^\d.]/g, ''));
        }
        const updated = yield Product_model_1.Product.findByIdAndUpdate(req.params.id, req.body, {
            returnDocument: 'after',
        });
        (0, response_utils_1.sendSuccess)(res, updated, 'Product updated.');
    }
    catch (error) {
        next(error);
    }
});
exports.updateProduct = updateProduct;
// POST /api/v1/products/:id/wishlist
const toggleWishlist = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productId = req.params.id;
        const product = yield Product_model_1.Product.findById(productId);
        if (!product)
            throw new error_middleware_1.AppError('Product not found.', 404);
        const user = yield User_model_1.User.findById(req.user.id).select('+wishlist');
        // ✅ Fix: any use karke type error avoid kiya
        const wishlist = Array.isArray(user === null || user === void 0 ? void 0 : user.wishlist)
            ? user.wishlist
            : [];
        // ✅ Fix: String() se ensure kiya ki productId string hai
        const isWishlisted = wishlist.includes(String(productId));
        if (isWishlisted) {
            yield User_model_1.User.findByIdAndUpdate(req.user.id, { $pull: { wishlist: productId } });
            (0, response_utils_1.sendSuccess)(res, { wishlisted: false }, 'Removed from wishlist.');
        }
        else {
            yield User_model_1.User.findByIdAndUpdate(req.user.id, { $addToSet: { wishlist: productId } });
            (0, response_utils_1.sendSuccess)(res, { wishlisted: true }, 'Added to wishlist.');
        }
    }
    catch (error) {
        next(error);
    }
});
exports.toggleWishlist = toggleWishlist;
