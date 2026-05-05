"use strict";
// admin.routes.ts — COMPLETE FILE (replace existing)
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const admin_controller_1 = require("../controllers/admin.controller");
const router = express_1.default.Router();
// All admin routes require auth + ADMIN role
router.use(auth_middleware_1.protect, (0, auth_middleware_1.restrictTo)('ADMIN'));
// Stats
router.get('/stats', admin_controller_1.getStats);
// User management
router.get('/users', admin_controller_1.getAllUsers); // ?page=1&limit=20&search=john&role=USER&status=active
router.patch('/user/ban/:id', admin_controller_1.banUser);
router.patch('/user/unban/:id', admin_controller_1.unbanUser);
router.patch('/user/role/:id', admin_controller_1.changeUserRole); // body: { role: 'ADMIN' }
router.delete('/user/:id', admin_controller_1.deleteUser);
exports.default = router;
