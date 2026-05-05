"use strict";
// auth.routes.ts — COMPLETE FILE (replace existing)
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const router = (0, express_1.Router)();
// Auth
router.post('/register', (0, validation_middleware_1.validate)(validation_middleware_1.registerSchema), auth_controller_1.register);
router.post('/login', (0, validation_middleware_1.validate)(validation_middleware_1.loginSchema), auth_controller_1.login);
router.post('/refresh', (0, validation_middleware_1.validate)(validation_middleware_1.refreshSchema), auth_controller_1.refreshToken);
router.post('/logout', auth_middleware_1.protect, auth_controller_1.logout);
router.get('/me', auth_middleware_1.protect, auth_controller_1.getMe);
router.put('/update-profile', auth_middleware_1.protect, auth_controller_1.updateProfile);
router.post('/google', auth_controller_1.googleAuth);
// Password reset flow
router.post('/forgot-password', auth_controller_1.forgotPassword);
router.post('/verify-otp', auth_controller_1.verifyOtp);
router.post('/reset-password', auth_controller_1.resetPassword);
// ✅ Email verification flow (post-register)
router.post('/verify-email', auth_controller_1.verifyEmail);
router.post('/resend-verification-otp', auth_controller_1.resendVerificationOtp);
exports.default = router;
