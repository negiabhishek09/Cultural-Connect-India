import { Router } from "express";
import {
  getEvents,
  getEventBySlug,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
} from "../controllers/event.controller";
import { protect, restrictTo } from "../middleware/auth.middleware";

// ✅ Models yahan import karo taaki mongoose register kar le
import "../models/State.model";
import "../models/Category.model";

const router = Router();

// PUBLIC
router.get("/", getEvents);
router.get("/:slug", getEventBySlug);

// ADMIN
router.post("/", protect, restrictTo("ADMIN"), createEvent);
router.patch("/:id", protect, restrictTo("ADMIN"), updateEvent);
router.delete("/:id", protect, restrictTo("ADMIN"), deleteEvent);

// USER
router.post("/register-event", registerForEvent);

export default router;