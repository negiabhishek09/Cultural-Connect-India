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
exports.deletePost = exports.addComment = exports.getComments = exports.toggleSave = exports.toggleLike = exports.createPost = exports.getLikedPosts = exports.getPosts = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Post_model_1 = require("../models/Post.model");
const response_utils_1 = require("../utils/response.utils");
const error_middleware_1 = require("../middleware/error.middleware");
// GET /api/v1/posts
const getPosts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { page, limit, skip } = (0, response_utils_1.parsePagination)(req.query);
        const { categoryId } = req.query;
        const filter = { isActive: true };
        if (categoryId)
            filter.categoryId = categoryId;
        const [posts, total] = yield Promise.all([
            Post_model_1.Post.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('userId', 'name avatar location')
                .populate('categoryId', 'name slug'),
            Post_model_1.Post.countDocuments(filter),
        ]);
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const enriched = posts.map((post) => {
            // ✅ Fix: unknown pehle, phir Record<string, unknown>
            const obj = post.toJSON();
            obj.likeCount = post.likes.length;
            obj.commentCount = post.comments.length;
            obj.isLiked = userId
                ? post.likes.some((id) => id.toString() === userId)
                : false;
            obj.isSaved = userId
                ? post.savedBy.some((id) => id.toString() === userId)
                : false;
            delete obj.likes;
            delete obj.savedBy;
            return obj;
        });
        (0, response_utils_1.sendPaginated)(res, enriched, { page, limit, total, totalPages: Math.ceil(total / limit) });
    }
    catch (error) {
        next(error);
    }
});
exports.getPosts = getPosts;
// GET /api/v1/posts/liked
const getLikedPosts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = new mongoose_1.default.Types.ObjectId(req.user.id);
        const { page, limit, skip } = (0, response_utils_1.parsePagination)(req.query);
        const [posts, total] = yield Promise.all([
            Post_model_1.Post.find({ likes: userId, isActive: true })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('userId', 'name avatar location')
                .populate('categoryId', 'name slug'),
            Post_model_1.Post.countDocuments({ likes: userId, isActive: true }),
        ]);
        const enriched = posts.map((post) => {
            // ✅ Fix: unknown pehle, phir Record<string, unknown>
            const obj = post.toJSON();
            obj.likeCount = post.likes.length;
            obj.commentCount = post.comments.length;
            obj.isLiked = true;
            obj.isSaved = post.savedBy.some((id) => id.toString() === req.user.id);
            delete obj.likes;
            delete obj.savedBy;
            return obj;
        });
        (0, response_utils_1.sendPaginated)(res, enriched, { page, limit, total, totalPages: Math.ceil(total / limit) });
    }
    catch (error) {
        next(error);
    }
});
exports.getLikedPosts = getLikedPosts;
// POST /api/v1/posts
const createPost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield Post_model_1.Post.create(Object.assign(Object.assign({}, req.body), { userId: req.user.id }));
        const populated = yield post.populate('userId', 'name avatar location');
        (0, response_utils_1.sendSuccess)(res, populated, 'Post created successfully.', 201);
    }
    catch (error) {
        next(error);
    }
});
exports.createPost = createPost;
// POST /api/v1/posts/:id/like — toggle
const toggleLike = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield Post_model_1.Post.findById(req.params.id);
        if (!post || !post.isActive)
            throw new error_middleware_1.AppError('Post not found.', 404);
        const userId = new mongoose_1.default.Types.ObjectId(req.user.id);
        const alreadyLiked = post.likes.some((id) => id.toString() === userId.toString());
        if (alreadyLiked) {
            post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
            yield post.save();
            (0, response_utils_1.sendSuccess)(res, { liked: false, likeCount: post.likes.length }, 'Post unliked.');
        }
        else {
            post.likes.push(userId);
            yield post.save();
            (0, response_utils_1.sendSuccess)(res, { liked: true, likeCount: post.likes.length }, 'Post liked.');
        }
    }
    catch (error) {
        next(error);
    }
});
exports.toggleLike = toggleLike;
// POST /api/v1/posts/:id/save — toggle bookmark
const toggleSave = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield Post_model_1.Post.findById(req.params.id);
        if (!post || !post.isActive)
            throw new error_middleware_1.AppError('Post not found.', 404);
        const userId = new mongoose_1.default.Types.ObjectId(req.user.id);
        const alreadySaved = post.savedBy.some((id) => id.toString() === userId.toString());
        if (alreadySaved) {
            post.savedBy = post.savedBy.filter((id) => id.toString() !== userId.toString());
            yield post.save();
            (0, response_utils_1.sendSuccess)(res, { saved: false }, 'Post unsaved.');
        }
        else {
            post.savedBy.push(userId);
            yield post.save();
            (0, response_utils_1.sendSuccess)(res, { saved: true }, 'Post saved.');
        }
    }
    catch (error) {
        next(error);
    }
});
exports.toggleSave = toggleSave;
// GET /api/v1/posts/:id/comments
const getComments = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, limit, skip } = (0, response_utils_1.parsePagination)(req.query);
        const post = yield Post_model_1.Post.findById(req.params.id)
            .select('comments')
            .populate('comments.userId', 'name avatar');
        if (!post)
            throw new error_middleware_1.AppError('Post not found.', 404);
        const allComments = post.comments;
        const total = allComments.length;
        const paginated = allComments.slice(skip, skip + limit);
        (0, response_utils_1.sendPaginated)(res, paginated, { page, limit, total, totalPages: Math.ceil(total / limit) });
    }
    catch (error) {
        next(error);
    }
});
exports.getComments = getComments;
// POST /api/v1/posts/:id/comments
const addComment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield Post_model_1.Post.findById(req.params.id);
        if (!post || !post.isActive)
            throw new error_middleware_1.AppError('Post not found.', 404);
        post.comments.push({
            userId: new mongoose_1.default.Types.ObjectId(req.user.id),
            content: req.body.content,
            createdAt: new Date(),
        });
        yield post.save();
        yield post.populate('comments.userId', 'name avatar');
        const newComment = post.comments[post.comments.length - 1];
        (0, response_utils_1.sendSuccess)(res, newComment, 'Comment added.', 201);
    }
    catch (error) {
        next(error);
    }
});
exports.addComment = addComment;
// DELETE /api/v1/posts/:id
const deletePost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield Post_model_1.Post.findById(req.params.id);
        if (!post)
            throw new error_middleware_1.AppError('Post not found.', 404);
        if (post.userId.toString() !== req.user.id && req.user.role !== 'ADMIN') {
            throw new error_middleware_1.AppError('You can only delete your own posts.', 403);
        }
        post.isActive = false;
        yield post.save();
        (0, response_utils_1.sendSuccess)(res, null, 'Post deleted successfully.');
    }
    catch (error) {
        next(error);
    }
});
exports.deletePost = deletePost;
