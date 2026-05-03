import { Router } from 'express';
import {
  getPosts,
  getLikedPosts,
  createPost,
  toggleLike,
  toggleSave,
  getComments,
  addComment,
  deletePost,
} from '../controllers/post.controller';
import { protect, optionalAuth } from '../middleware/auth.middleware';
import { validate, createPostSchema, addCommentSchema } from '../middleware/validation.middleware';

const router = Router();

// ✅ /liked pehle — warna /:id isko capture kar leta
router.get('/liked',           protect, getLikedPosts);

router.get('/',                optionalAuth, getPosts);
router.post('/',               protect, validate(createPostSchema), createPost);
router.post('/:id/like',       protect, toggleLike);
router.post('/:id/save',       protect, toggleSave);
router.get('/:id/comments',    optionalAuth, getComments);
router.post('/:id/comments',   protect, validate(addCommentSchema), addComment);
router.delete('/:id',          protect, deletePost);

export default router;