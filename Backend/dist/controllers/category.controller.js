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
exports.updateCategory = exports.createCategory = exports.getCategoryBySlug = exports.getCategories = void 0;
const slugify_1 = __importDefault(require("slugify"));
const Category_model_1 = require("../models/Category.model");
const response_utils_1 = require("../utils/response.utils");
const error_middleware_1 = require("../middleware/error.middleware");
// GET /api/v1/categories
const getCategories = (_req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield Category_model_1.Category.find({ isActive: true }).sort({ name: 1 });
        (0, response_utils_1.sendSuccess)(res, categories);
    }
    catch (error) {
        next(error);
    }
});
exports.getCategories = getCategories;
// GET /api/v1/categories/:slug
const getCategoryBySlug = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const category = yield Category_model_1.Category.findOne({ slug: req.params.slug, isActive: true });
        if (!category)
            throw new error_middleware_1.AppError('Category not found.', 404);
        (0, response_utils_1.sendSuccess)(res, category);
    }
    catch (error) {
        next(error);
    }
});
exports.getCategoryBySlug = getCategoryBySlug;
// POST /api/v1/categories — admin only
const createCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const slug = (0, slugify_1.default)(req.body.name, { lower: true, strict: true });
        const category = yield Category_model_1.Category.create(Object.assign(Object.assign({}, req.body), { slug }));
        (0, response_utils_1.sendSuccess)(res, category, 'Category created.', 201);
    }
    catch (error) {
        next(error);
    }
});
exports.createCategory = createCategory;
// PATCH /api/v1/categories/:id — admin only
const updateCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const category = yield Category_model_1.Category.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!category)
            throw new error_middleware_1.AppError('Category not found.', 404);
        (0, response_utils_1.sendSuccess)(res, category, 'Category updated.');
    }
    catch (error) {
        next(error);
    }
});
exports.updateCategory = updateCategory;
