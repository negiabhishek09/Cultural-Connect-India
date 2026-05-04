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

// ── Public ────────────────────────────────────────────────
router.get('/',          getEvents);
router.get('/:slug',     getEventBySlug);
router.post('/register', registerForEvent);   // public — naam + email se register

// ── Logged-in user ────────────────────────────────────────
router.get('/my-registrations',            protect, getMyRegistrations);
router.delete('/:id/cancel-registration',  protect, cancelRegistration);

// ── Admin only ────────────────────────────────────────────
router.post('/',        protect, restrictTo('ADMIN'), createEvent);
router.put('/:id',      protect, restrictTo('ADMIN'), updateEvent);
router.delete('/:id',   protect, restrictTo('ADMIN'), deleteEvent);

export default router;