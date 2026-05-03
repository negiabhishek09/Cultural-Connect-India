import { Router } from 'express';
import { getProfile, updateProfile, changePassword, getWishlist, getSavedPosts, getAllUsers } from '../controllers/user.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { validate, updateProfileSchema, changePasswordSchema } from '../middleware/validation.middleware';
import { upload } from "../middleware/upload.middleware";
import { User } from '../models/User.model';

const router = Router();
router.use(protect);
router.get('/profile',           getProfile);
router.patch('/profile',         validate(updateProfileSchema),  updateProfile);
router.patch('/change-password', validate(changePasswordSchema), changePassword);
router.get('/wishlist',          getWishlist);
router.get('/saved-posts',       getSavedPosts);
router.get('/',                  restrictTo('ADMIN'), getAllUsers);
router.get('/profile', getProfile);

router.patch('/profile', validate(updateProfileSchema), updateProfile);

// 🔥 ADD THIS HERE
router.post('/avatar', upload.single('avatar'), async (req: any, res) => {
  try {
    const userId = req.user.id;

    const avatarUrl = req.file.path;

    await User.findByIdAndUpdate(userId, {
      avtar: avatarUrl,
    });

    res.json({ success: true, avatar: avatarUrl });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

router.patch('/change-password', validate(changePasswordSchema), changePassword);
export default router;