"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const admin_controller_1 = require("../controllers/admin.controller");
const router = express_1.default.Router();
// 👑 ONLY ADMIN ROUTES
router.get("/users", auth_middleware_1.protect, (0, auth_middleware_1.restrictTo)("ADMIN"), admin_controller_1.getAllUsers);
router.delete("/user/:id", auth_middleware_1.protect, (0, auth_middleware_1.restrictTo)("ADMIN"), admin_controller_1.deleteUser);
router.patch("/user/block/:id", auth_middleware_1.protect, (0, auth_middleware_1.restrictTo)("ADMIN"), admin_controller_1.blockUser);
router.get("/stats", auth_middleware_1.protect, (0, auth_middleware_1.restrictTo)("ADMIN"), admin_controller_1.getStats); // ✅ stats route
exports.default = router;
