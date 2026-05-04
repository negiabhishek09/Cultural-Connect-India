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
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const upload_middleware_1 = require("../middleware/upload.middleware");
const User_model_1 = require("../models/User.model");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.protect);
router.get('/profile', user_controller_1.getProfile);
router.patch('/profile', (0, validation_middleware_1.validate)(validation_middleware_1.updateProfileSchema), user_controller_1.updateProfile);
router.patch('/change-password', (0, validation_middleware_1.validate)(validation_middleware_1.changePasswordSchema), user_controller_1.changePassword);
router.get('/wishlist', user_controller_1.getWishlist);
router.get('/saved-posts', user_controller_1.getSavedPosts);
router.get('/', (0, auth_middleware_1.restrictTo)('ADMIN'), user_controller_1.getAllUsers);
router.get('/profile', user_controller_1.getProfile);
router.patch('/profile', (0, validation_middleware_1.validate)(validation_middleware_1.updateProfileSchema), user_controller_1.updateProfile);
// 🔥 ADD THIS HERE
router.post('/avatar', upload_middleware_1.upload.single('avatar'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const avatarUrl = req.file.path;
        yield User_model_1.User.findByIdAndUpdate(userId, {
            avtar: avatarUrl,
        });
        res.json({ success: true, avatar: avatarUrl });
    }
    catch (err) {
        res.status(500).json({ success: false });
    }
}));
router.patch('/change-password', (0, validation_middleware_1.validate)(validation_middleware_1.changePasswordSchema), user_controller_1.changePassword);
exports.default = router;
