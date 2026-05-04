"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const stats_controller_1 = require("../controllers/stats.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get('/public', stats_controller_1.getPublicStats);
router.get('/admin', auth_middleware_1.protect, (0, auth_middleware_1.restrictTo)('ADMIN'), stats_controller_1.getAdminStats);
exports.default = router;
