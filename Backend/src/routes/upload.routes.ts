import { Router, Request, Response, NextFunction } from 'express';
import { protect } from '../middleware/auth.middleware';
import { upload, uploadToCloudinary } from '../services/upload.service';
import { sendSuccess, sendError } from '../utils/response.utils';

const router = Router();
router.use(protect);

const handleUpload = (folder: string) => async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) { sendError(res, 'No image file provided.', 400); return; }
    const { url } = await uploadToCloudinary(req.file.buffer, folder);
    sendSuccess(res, { url }, 'Image uploaded successfully.');
  } catch (error) {
    next(error);
  }
};

router.post('/avatar',   upload.single('image'), handleUpload('avatars'));
router.post('/post',     upload.single('image'), handleUpload('posts'));
router.post('/product',  upload.single('image'), handleUpload('products'));
router.post('/business', upload.single('image'), handleUpload('businesses'));
export default router;