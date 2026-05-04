// event.routes.ts — COMPLETE FILE (replace existing)
// Apne existing route file mein jo bhi tha usse replace karo

import { Router } from 'express';
import {
  getEvents,
  getEventBySlug,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  getMyRegistrations,
  cancelRegistration,
} from '../controllers/event.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();

// ── Specific routes PEHLE — /:slug se upar rehne chahiye ──
router.get('/my-registrations',           protect, getMyRegistrations);
router.post('/register',                  registerForEvent);

// ── Public ────────────────────────────────────────────────
router.get('/',        getEvents);
router.get('/:slug',   getEventBySlug);  // ⚠️ wildcard hamesha last mein

// ── Logged-in user ────────────────────────────────────────
router.delete('/:id/cancel-registration', protect, cancelRegistration);

// ── Admin only ────────────────────────────────────────────
router.post('/',        protect, restrictTo('ADMIN'), createEvent);
router.put('/:id',      protect, restrictTo('ADMIN'), updateEvent);
router.delete('/:id',   protect, restrictTo('ADMIN'), deleteEvent);

export default router;