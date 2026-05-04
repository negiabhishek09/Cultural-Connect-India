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
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.restrictTo = exports.protect = void 0;
const jwt_utils_1 = require("../utils/jwt.utils");
const User_model_1 = require("../models/User.model");
const response_utils_1 = require("../utils/response.utils");
const protect = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authHeader = req.headers.authorization;
        if (!(authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith('Bearer '))) {
            (0, response_utils_1.sendError)(res, 'No token provided. Please login.', 401);
            return;
        }
        const token = authHeader.split(' ')[1];
        const decoded = (0, jwt_utils_1.verifyAccessToken)(token);
        const user = yield User_model_1.User.findById(decoded.id).select('name email role isActive');
        if (!user || !user.isActive) {
            (0, response_utils_1.sendError)(res, 'User no longer exists or has been deactivated.', 401);
            return;
        }
        req.user = {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
            name: user.name
        };
        next();
    }
    catch (_a) {
        (0, response_utils_1.sendError)(res, 'Invalid or expired token. Please login again.', 401);
    }
});
exports.protect = protect;
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            (0, response_utils_1.sendError)(res, 'You do not have permission to perform this action.', 403);
            return;
        }
        next();
    };
};
exports.restrictTo = restrictTo;
const optionalAuth = (req, _res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = (0, jwt_utils_1.verifyAccessToken)(token);
            const user = yield User_model_1.User.findById(decoded.id).select('name email role isActive');
            if (user === null || user === void 0 ? void 0 : user.isActive) {
                req.user = {
                    id: user._id.toString(),
                    email: user.email,
                    role: user.role,
                    name: user.name
                };
            }
        }
    }
    catch (_a) { }
    next();
});
exports.optionalAuth = optionalAuth;
