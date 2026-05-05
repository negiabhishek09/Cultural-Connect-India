"use strict";
// event.routes.ts — COMPLETE FILE (replace existing)
// Apne existing route file mein jo bhi tha usse replace karo
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const event_controller_1 = require("../controllers/event.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// ── Specific routes PEHLE — /:slug se upar rehne chahiye ──
router.get('/my-registrations', auth_middleware_1.protect, event_controller_1.getMyRegistrations);
router.post('/register', event_controller_1.registerForEvent);
// ── Public ────────────────────────────────────────────────
router.get('/', event_controller_1.getEvents);
router.get('/:slug', event_controller_1.getEventBySlug); // ⚠️ wildcard hamesha last mein
// ── Logged-in user ────────────────────────────────────────
router.delete('/:id/cancel-registration', auth_middleware_1.protect, event_controller_1.cancelRegistration);
// ── Admin only ────────────────────────────────────────────
router.post('/', auth_middleware_1.protect, (0, auth_middleware_1.restrictTo)('ADMIN'), event_controller_1.createEvent);
router.put('/:id', auth_middleware_1.protect, (0, auth_middleware_1.restrictTo)('ADMIN'), event_controller_1.updateEvent);
router.delete('/:id', auth_middleware_1.protect, (0, auth_middleware_1.restrictTo)('ADMIN'), event_controller_1.deleteEvent);
exports.default = router;
