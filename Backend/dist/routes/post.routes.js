"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const post_controller_1 = require("../controllers/post.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const router = (0, express_1.Router)();
// ✅ /liked pehle — warna /:id isko capture kar leta
router.get('/liked', auth_middleware_1.protect, post_controller_1.getLikedPosts);
router.get('/', auth_middleware_1.optionalAuth, post_controller_1.getPosts);
router.post('/', auth_middleware_1.protect, (0, validation_middleware_1.validate)(validation_middleware_1.createPostSchema), post_controller_1.createPost);
router.post('/:id/like', auth_middleware_1.protect, post_controller_1.toggleLike);
router.post('/:id/save', auth_middleware_1.protect, post_controller_1.toggleSave);
router.get('/:id/comments', auth_middleware_1.optionalAuth, post_controller_1.getComments);
router.post('/:id/comments', auth_middleware_1.protect, (0, validation_middleware_1.validate)(validation_middleware_1.addCommentSchema), post_controller_1.addComment);
router.delete('/:id', auth_middleware_1.protect, post_controller_1.deletePost);
exports.default = router;
