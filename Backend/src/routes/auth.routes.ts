// auth.routes.ts — COMPLETE FILE (replace existing)

import { Router } from 'express';
import {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  updateProfile,
  googleAuth,
  forgotPassword,
  resetPassword,
  verifyOtp,
  verifyEmail,              // ✅ NEW
  resendVerificationOtp,    // ✅ NEW
} from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';
import { validate, registerSchema, loginSchema, refreshSchema } from '../middleware/validation.middleware';

const router = Router();

// Auth
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', validate(refreshSchema), refreshToken);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);
router.post('/google', googleAuth);

// Password reset flow
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);

// ✅ Email verification flow (post-register)
router.post('/verify-email', verifyEmail);
router.post('/resend-verification-otp', resendVerificationOtp);

export default router;