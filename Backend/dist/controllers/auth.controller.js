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
exports.updateProfile = exports.getMe = exports.logout = exports.refreshToken = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_model_1 = require("../models/User.model");
const jwt_utils_1 = require("../utils/jwt.utils");
const response_utils_1 = require("../utils/response.utils");
const error_middleware_1 = require("../middleware/error.middleware");
// import { sendWelcomeEmail, sendOTPEmail } from '../utils/email';
const email_service_1 = require("../services/email.service");
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
        // ✅ FIX: Arguments sahi order mein — sendWelcomeEmail(name, email)
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
