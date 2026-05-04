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
const auth_middleware_1 = require("../middleware/auth.middleware");
const upload_service_1 = require("../services/upload.service");
const response_utils_1 = require("../utils/response.utils");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.protect);
const handleUpload = (folder) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            (0, response_utils_1.sendError)(res, 'No image file provided.', 400);
            return;
        }
        const { url } = yield (0, upload_service_1.uploadToCloudinary)(req.file.buffer, folder);
        (0, response_utils_1.sendSuccess)(res, { url }, 'Image uploaded successfully.');
    }
    catch (error) {
        next(error);
    }
});
router.post('/avatar', upload_service_1.upload.single('image'), handleUpload('avatars'));
router.post('/post', upload_service_1.upload.single('image'), handleUpload('posts'));
router.post('/product', upload_service_1.upload.single('image'), handleUpload('products'));
router.post('/business', upload_service_1.upload.single('image'), handleUpload('businesses'));
exports.default = router;
