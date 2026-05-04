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
const express_1 = __importDefault(require("express"));
const upload_middleware_1 = require("../middleware/upload.middleware");
const auth_middleware_1 = require("../middleware/auth.middleware");
const Post_model_1 = require("../models/Post.model");
const router = express_1.default.Router();
// ✅ CREATE POST
router.post("/", auth_middleware_1.protect, upload_middleware_1.upload.single("image"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { caption } = req.body;
        const post = yield Post_model_1.Post.create({
            caption,
            image: req.file ? req.file.path : "",
            userId: req.user.id,
        });
        const populatedPost = yield Post_model_1.Post.findById(post._id).populate("userId", "name avatar location");
        res.json({ success: true, data: populatedPost });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
}));
// ✅ GET ALL POSTS
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const posts = yield Post_model_1.Post.find()
            .populate("userId", "name avatar location")
            .populate("comments.userId", "name avatar") // ✅ populate comment users too
            .sort({ createdAt: -1 });
        res.json({ success: true, data: posts });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
}));
// ✅ ADD COMMENT — yeh route missing tha
router.post("/comment", auth_middleware_1.protect, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { postId, text } = req.body;
        if (!postId || !(text === null || text === void 0 ? void 0 : text.trim())) {
            return res.status(400).json({ message: "postId aur text dono required hain" });
        }
        const post = yield Post_model_1.Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post nahi mila" });
        }
        // Model mein field ka naam "content" hai, "text" nahi
        post.comments.push({
            userId: req.user.id,
            content: text.trim(),
            createdAt: new Date(),
        });
        yield post.save();
        // Populate karke return karo taaki frontend pe name/avatar mile
        const updatedPost = yield Post_model_1.Post.findById(postId).populate("comments.userId", "name avatar");
        const savedComment = updatedPost.comments[updatedPost.comments.length - 1];
        res.json({ success: true, data: savedComment });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
}));
router.post("/:id/like", auth_middleware_1.protect, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const postId = req.params.id;
        const userId = req.user.id;
        const post = yield Post_model_1.Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post nahi mila" });
        }
        // 🔥 FIX: ObjectId compare properly
        const alreadyLiked = (_a = post.likes) === null || _a === void 0 ? void 0 : _a.some((id) => id.toString() === userId);
        if (alreadyLiked) {
            // ❌ UNLIKE
            post.likes = post.likes.filter((id) => id.toString() !== userId);
        }
        else {
            // ✅ LIKE
            post.likes.push(userId);
        }
        yield post.save();
        res.json({
            success: true,
            liked: !alreadyLiked,
            totalLikes: post.likes.length,
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
}));
exports.default = router;
