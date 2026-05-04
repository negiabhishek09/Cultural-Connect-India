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
exports.addReview = exports.updateBusiness = exports.createBusiness = exports.getBusinessBySlug = exports.getBusinesses = void 0;
const slugify_1 = __importDefault(require("slugify"));
const Business_model_1 = require("../models/Business.model");
const response_utils_1 = require("../utils/response.utils");
const error_middleware_1 = require("../middleware/error.middleware");
// GET /api/v1/businesses
const getBusinesses = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, limit, skip } = (0, response_utils_1.parsePagination)(req.query);
        const { stateId, categoryId, verified, featured, search } = req.query;
        const filter = { isActive: true };
        if (stateId)
            filter.stateId = stateId;
        if (categoryId)
            filter.categoryId = categoryId;
        if (verified === 'true')
            filter.isVerified = true;
        if (featured === 'true')
            filter.isFeatured = true;
        if (search)
            filter.name = { $regex: search, $options: 'i' };
        const [businesses, total] = yield Promise.all([
            Business_model_1.Business.find(filter)
                .sort({ isFeatured: -1, rating: -1 })
                .skip(skip)
                .limit(limit)
                .populate('stateId', 'name slug')
                .populate('categoryId', 'name slug')
                .populate('ownerId', 'name avatar')
                .select('-reviews'), // don't ship full reviews array on list
            Business_model_1.Business.countDocuments(filter),
        ]);
        (0, response_utils_1.sendPaginated)(res, businesses, { page, limit, total, totalPages: Math.ceil(total / limit) });
    }
    catch (error) {
        next(error);
    }
});
exports.getBusinesses = getBusinesses;
// GET /api/v1/businesses/:slug
const getBusinessBySlug = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const business = yield Business_model_1.Business.findOne({ slug: req.params.slug, isActive: true })
            .populate('stateId')
            .populate('categoryId')
            .populate('ownerId', 'name avatar')
            .populate('reviews.userId', 'name avatar');
        if (!business)
            throw new error_middleware_1.AppError('Business not found.', 404);
        (0, response_utils_1.sendSuccess)(res, business);
    }
    catch (error) {
        next(error);
    }
});
exports.getBusinessBySlug = getBusinessBySlug;
// POST /api/v1/businesses
const createBusiness = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const slug = (0, slugify_1.default)(req.body.name, { lower: true, strict: true }) + `-${Date.now()}`;
        const business = yield Business_model_1.Business.create(Object.assign(Object.assign({}, req.body), { slug, ownerId: req.user.id }));
        (0, response_utils_1.sendSuccess)(res, business, 'Business registered successfully.', 201);
    }
    catch (error) {
        next(error);
    }
});
exports.createBusiness = createBusiness;
// PATCH /api/v1/businesses/:id
const updateBusiness = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const business = yield Business_model_1.Business.findById(req.params.id);
        if (!business)
            throw new error_middleware_1.AppError('Business not found.', 404);
        if (req.user.role !== 'ADMIN' && business.ownerId.toString() !== req.user.id) {
            throw new error_middleware_1.AppError('You can only update your own business.', 403);
        }
        // Prevent overwriting protected fields
        delete req.body.ownerId;
        delete req.body.slug;
        delete req.body.reviews;
        const updated = yield Business_model_1.Business.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        (0, response_utils_1.sendSuccess)(res, updated, 'Business updated.');
    }
    catch (error) {
        next(error);
    }
});
exports.updateBusiness = updateBusiness;
// POST /api/v1/businesses/:id/reviews
const addReview = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { rating, comment } = req.body;
        const userId = req.user.id;
        const business = yield Business_model_1.Business.findById(req.params.id);
        if (!business)
            throw new error_middleware_1.AppError('Business not found.', 404);
        // Upsert review (one review per user)
        const existingIndex = business.reviews.findIndex((r) => r.userId.toString() === userId);
        if (existingIndex > -1) {
            business.reviews[existingIndex].rating = rating;
            business.reviews[existingIndex].comment = comment;
        }
        else {
            business.reviews.push({ userId, rating, comment, createdAt: new Date() });
        }
        // Recalculate average rating
        const total = business.reviews.reduce((sum, r) => sum + r.rating, 0);
        business.rating = Math.round((total / business.reviews.length) * 10) / 10;
        business.reviewCount = business.reviews.length;
        yield business.save();
        yield business.populate('reviews.userId', 'name avatar');
        (0, response_utils_1.sendSuccess)(res, { rating: business.rating, reviewCount: business.reviewCount }, 'Review submitted.');
    }
    catch (error) {
        next(error);
    }
});
exports.addReview = addReview;
