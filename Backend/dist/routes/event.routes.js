"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const event_controller_1 = require("../controllers/event.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
// ✅ Models yahan import karo taaki mongoose register kar le
require("../models/State.model");
require("../models/Category.model");
const router = (0, express_1.Router)();
// PUBLIC
router.get("/", event_controller_1.getEvents);
router.get("/:slug", event_controller_1.getEventBySlug);
// ADMIN
router.post("/", auth_middleware_1.protect, (0, auth_middleware_1.restrictTo)("ADMIN"), event_controller_1.createEvent);
router.patch("/:id", auth_middleware_1.protect, (0, auth_middleware_1.restrictTo)("ADMIN"), event_controller_1.updateEvent);
router.delete("/:id", auth_middleware_1.protect, (0, auth_middleware_1.restrictTo)("ADMIN"), event_controller_1.deleteEvent);
// USER
router.post("/register-event", event_controller_1.registerForEvent);
exports.default = router;
