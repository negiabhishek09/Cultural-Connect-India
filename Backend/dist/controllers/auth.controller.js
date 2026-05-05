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
exports.resendVerificationOtp = exports.verifyEmail = exports.resetPassword = exports.verifyOtp = exports.forgotPassword = exports.googleAuth = exports.updateProfile = exports.getMe = exports.logout = exports.refreshToken = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const google_auth_library_1 = require("google-auth-library");
const User_model_1 = require("../models/User.model");
const jwt_utils_1 = require("../utils/jwt.utils");
const response_utils_1 = require("../utils/response.utils");
const error_middleware_1 = require("../middleware/error.middleware");
const email_service_1 = require("../services/email.service");
const googleClient = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
// POST /api/v1/auth/register
const register = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password, location } = req.body;
        const existing = yield User_model_1.User.findOne({ email: email.toLowerCase() });
        if (existing) {
            (0, response_utils_1.sendError)(res, 'An account with this email already exists.', 409);
            return;
        }
        const user = yield User_model_1.User.create({
            name,
            email: email.toLowerCase(),
            password,
            location,
        });
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const payload = { id: user._id.toString(), email: user.email, role: user.role };
        const accessToken = (0, jwt_utils_1.generateAccessToken)(payload);
        const refreshToken = (0, jwt_utils_1.generateRefreshToken)(payload);
        const hashedRefreshToken = yield bcryptjs_1.default.hash(refreshToken, 8);
        yield User_model_1.User.findByIdAndUpdate(user._id, {
            otp,
            otpExpires: new Date(Date.now() + 5 * 60 * 1000),
            refreshToken: hashedRefreshToken,
        });
        yield (0, email_service_1.sendWelcomeEmail)(user.name, user.email);
        yield (0, email_service_1.sendOTPEmail)(user.email, otp);
        const safeUser = yield User_model_1.User.findById(user._id);
        (0, response_utils_1.sendSuccess)(res, { user: safeUser, accessToken, refreshToken }, 'Account created successfully.', 201);
    }
    catch (error) {
        next(error);
    }
});
exports.register = register;
// POST /api/v1/auth/login
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const normalizedEmail = email.toLowerCase();
        const user = yield User_model_1.User.findOne({ email: normalizedEmail }).select('+password +refreshToken');
        if (!user) {
            (0, response_utils_1.sendError)(res, 'Invalid email or password.', 401);
            return;
        }
        if (!user.isActive) {
            (0, response_utils_1.sendError)(res, 'Your account has been deactivated.', 403);
            return;
        }
        const isMatch = yield user.comparePassword(password);
        if (!isMatch) {
            (0, response_utils_1.sendError)(res, 'Invalid email or password.', 401);
            return;
        }
        const payload = { id: user._id.toString(), email: user.email, role: user.role };
        const accessToken = (0, jwt_utils_1.generateAccessToken)(payload);
        const refreshToken = (0, jwt_utils_1.generateRefreshToken)(payload);
        yield User_model_1.User.findByIdAndUpdate(user._id, {
            refreshToken: yield bcryptjs_1.default.hash(refreshToken, 8),
        });
        const safeUser = yield User_model_1.User.findById(user._id);
        (0, response_utils_1.sendSuccess)(res, { user: safeUser, accessToken, refreshToken }, 'Login successful.');
    }
    catch (error) {
        next(error);
    }
});
exports.login = login;
// POST /api/v1/auth/refresh
const refreshToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { refreshToken: token } = req.body;
        if (!token) {
            (0, response_utils_1.sendError)(res, 'Refresh token is required.', 400);
            return;
        }
        const decoded = (0, jwt_utils_1.verifyRefreshToken)(token);
        const user = yield User_model_1.User.findById(decoded.id).select('+refreshToken');
        if (!(user === null || user === void 0 ? void 0 : user.refreshToken)) {
            (0, response_utils_1.sendError)(res, 'Invalid refresh token.', 401);
            return;
        }
        const isValid = yield bcryptjs_1.default.compare(token, user.refreshToken);
        if (!isValid) {
            (0, response_utils_1.sendError)(res, 'Invalid refresh token.', 401);
            return;
        }
        const payload = { id: user._id.toString(), email: user.email, role: user.role };
        const newAccessToken = (0, jwt_utils_1.generateAccessToken)(payload);
        const newRefreshToken = (0, jwt_utils_1.generateRefreshToken)(payload);
        yield User_model_1.User.findByIdAndUpdate(user._id, {
            refreshToken: yield bcryptjs_1.default.hash(newRefreshToken, 8),
        });
        (0, response_utils_1.sendSuccess)(res, { accessToken: newAccessToken, refreshToken: newRefreshToken }, 'Token refreshed.');
    }
    catch (error) {
        next(error);
    }
});
exports.refreshToken = refreshToken;
// POST /api/v1/auth/logout
const logout = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield User_model_1.User.findByIdAndUpdate(req.user.id, { $unset: { refreshToken: 1 } });
        (0, response_utils_1.sendSuccess)(res, null, 'Logged out successfully.');
    }
    catch (error) {
        next(error);
    }
});
exports.logout = logout;
// GET /api/v1/auth/me
const getMe = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_model_1.User.findById(req.user.id);
        if (!user)
            throw new error_middleware_1.AppError('User not found.', 404);
        (0, response_utils_1.sendSuccess)(res, user);
    }
    catch (error) {
        next(error);
    }
});
exports.getMe = getMe;
// PUT /api/v1/auth/update-profile
const updateProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, bio, location, avatar } = req.body;
        const updateData = { name, bio, location };
        if (avatar)
            updateData.avatar = avatar;
        if (req.file)
            updateData.avatar = req.file.path;
        const user = yield User_model_1.User.findByIdAndUpdate(req.user.id, updateData, { new: true });
        if (!user)
            throw new error_middleware_1.AppError('User not found.', 404);
        (0, response_utils_1.sendSuccess)(res, { user }, 'Profile updated successfully.');
    }
    catch (error) {
        next(error);
    }
});
exports.updateProfile = updateProfile;
// POST /api/v1/auth/google
const googleAuth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { credential } = req.body;
        const ticket = yield googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload) {
            (0, response_utils_1.sendError)(res, 'Invalid Google token.', 401);
            return;
        }
        const { email, name, picture } = payload;
        let user = yield User_model_1.User.findOne({ email: email.toLowerCase() });
        if (!user) {
            user = yield User_model_1.User.create({
                name,
                email: email.toLowerCase(),
                password: Math.random().toString(36),
                avatar: picture,
                isVerified: true,
            });
            yield (0, email_service_1.sendWelcomeEmail)(user.name, user.email);
        }
        const tokenPayload = { id: user._id.toString(), email: user.email, role: user.role };
        const accessToken = (0, jwt_utils_1.generateAccessToken)(tokenPayload);
        const refreshToken = (0, jwt_utils_1.generateRefreshToken)(tokenPayload);
        yield User_model_1.User.findByIdAndUpdate(user._id, {
            refreshToken: yield bcryptjs_1.default.hash(refreshToken, 8),
        });
        const safeUser = yield User_model_1.User.findById(user._id);
        (0, response_utils_1.sendSuccess)(res, { user: safeUser, accessToken, refreshToken }, 'Google login successful.');
    }
    catch (error) {
        next(error);
    }
});
exports.googleAuth = googleAuth;
// POST /api/v1/auth/forgot-password
const forgotPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const user = yield User_model_1.User.findOne({ email: email.toLowerCase() });
        if (!user) {
            // Security: same response even if email doesn't exist (prevents user enumeration)
            (0, response_utils_1.sendSuccess)(res, null, 'If this email exists, an OTP has been sent.');
            return;
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        yield User_model_1.User.findByIdAndUpdate(user._id, {
            otp,
            otpExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 min (was 5 min)
        });
        yield (0, email_service_1.sendOTPEmail)(user.email, otp);
        (0, response_utils_1.sendSuccess)(res, null, 'OTP sent to your email.');
    }
    catch (error) {
        next(error);
    }
});
exports.forgotPassword = forgotPassword;
// POST /api/v1/auth/verify-otp
// Validates OTP — returns otpVerified flag so frontend can proceed to step 3
const verifyOtp = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            (0, response_utils_1.sendError)(res, 'Email and OTP are required.', 400);
            return;
        }
        const user = yield User_model_1.User.findOne({ email: email.toLowerCase() }).select('+otp +otpExpires');
        if (!user) {
            (0, response_utils_1.sendError)(res, 'No account found with this email.', 404);
            return;
        }
        if (!user.otp || !user.otpExpires) {
            (0, response_utils_1.sendError)(res, 'OTP not requested. Please request a new one.', 400);
            return;
        }
        if (user.otp !== otp) {
            (0, response_utils_1.sendError)(res, 'Invalid OTP.', 400);
            return;
        }
        if (user.otpExpires < new Date()) {
            (0, response_utils_1.sendError)(res, 'OTP has expired. Please request a new one.', 400);
            return;
        }
        // OTP sahi hai — mark verified in DB so reset-password can trust this session
        // We reuse otpExpires: extend by 15 min for password reset window
        yield User_model_1.User.findByIdAndUpdate(user._id, {
            otpExpires: new Date(Date.now() + 15 * 60 * 1000),
        });
        (0, response_utils_1.sendSuccess)(res, { otpVerified: true }, 'OTP verified successfully.');
    }
    catch (error) {
        next(error);
    }
});
exports.verifyOtp = verifyOtp;
// POST /api/v1/auth/reset-password
// Called after verify-otp — checks otp + expiry again as a second guard
const resetPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) {
            (0, response_utils_1.sendError)(res, 'Email, OTP, and new password are required.', 400);
            return;
        }
        if (newPassword.length < 8) {
            (0, response_utils_1.sendError)(res, 'Password must be at least 8 characters.', 400);
            return;
        }
        const user = yield User_model_1.User.findOne({ email: email.toLowerCase() }).select('+otp +otpExpires +password');
        if (!user) {
            (0, response_utils_1.sendError)(res, 'No account found with this email.', 404);
            return;
        }
        if (!user.otp || !user.otpExpires) {
            (0, response_utils_1.sendError)(res, 'OTP session expired. Please start over.', 400);
            return;
        }
        // Re-validate OTP as a second guard (prevents direct API abuse skipping verify step)
        if (user.otp !== otp) {
            (0, response_utils_1.sendError)(res, 'Invalid OTP.', 400);
            return;
        }
        if (user.otpExpires < new Date()) {
            (0, response_utils_1.sendError)(res, 'Session expired. Please request a new OTP.', 400);
            return;
        }
        // Update password (pre-save hook in User model handles hashing)
        user.password = newPassword;
        yield user.save();
        // Clear OTP fields
        yield User_model_1.User.findByIdAndUpdate(user._id, {
            $unset: { otp: 1, otpExpires: 1 },
        });
        (0, response_utils_1.sendSuccess)(res, null, 'Password reset successfully.');
    }
    catch (error) {
        next(error);
    }
});
exports.resetPassword = resetPassword;
// ─────────────────────────────────────────────────────────────
// ADD THIS to auth.controller.ts
// POST /api/v1/auth/verify-email
// Called after register — user submits OTP sent to their email
// ─────────────────────────────────────────────────────────────
const verifyEmail = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            (0, response_utils_1.sendError)(res, 'Email and OTP are required.', 400);
            return;
        }
        const user = yield User_model_1.User.findOne({ email: email.toLowerCase() }).select('+otp +otpExpires');
        if (!user) {
            (0, response_utils_1.sendError)(res, 'No account found with this email.', 404);
            return;
        }
        // Already verified — idempotent response
        if (user.isVerified) {
            (0, response_utils_1.sendSuccess)(res, null, 'Email is already verified.');
            return;
        }
        if (!user.otp || !user.otpExpires) {
            (0, response_utils_1.sendError)(res, 'No OTP found. Please request a new one.', 400);
            return;
        }
        if (user.otp !== otp) {
            (0, response_utils_1.sendError)(res, 'Invalid OTP.', 400);
            return;
        }
        if (user.otpExpires < new Date()) {
            (0, response_utils_1.sendError)(res, 'OTP has expired. Please request a new one.', 400);
            return;
        }
        // Mark verified + clear OTP fields
        yield User_model_1.User.findByIdAndUpdate(user._id, {
            isVerified: true,
            $unset: { otp: 1, otpExpires: 1 },
        });
        (0, response_utils_1.sendSuccess)(res, null, 'Email verified successfully.');
    }
    catch (error) {
        next(error);
    }
});
exports.verifyEmail = verifyEmail;
// ─────────────────────────────────────────────────────────────
// POST /api/v1/auth/resend-verification-otp
// User ne OTP miss kiya ya expire ho gaya — resend karo
// ─────────────────────────────────────────────────────────────
const resendVerificationOtp = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        if (!email) {
            (0, response_utils_1.sendError)(res, 'Email is required.', 400);
            return;
        }
        const user = yield User_model_1.User.findOne({ email: email.toLowerCase() });
        if (!user) {
            // Prevent user enumeration
            (0, response_utils_1.sendSuccess)(res, null, 'If this account exists, an OTP has been sent.');
            return;
        }
        if (user.isVerified) {
            (0, response_utils_1.sendSuccess)(res, null, 'Email is already verified.');
            return;
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        yield User_model_1.User.findByIdAndUpdate(user._id, {
            otp,
            otpExpires: new Date(Date.now() + 5 * 60 * 1000), // 5 min — same as register
        });
        yield (0, email_service_1.sendOTPEmail)(user.email, otp);
        (0, response_utils_1.sendSuccess)(res, null, 'OTP sent to your email.');
    }
    catch (error) {
        next(error);
    }
});
exports.resendVerificationOtp = resendVerificationOtp;
