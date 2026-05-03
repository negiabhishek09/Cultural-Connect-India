import express from "express";
import { protect, restrictTo } from "../middleware/auth.middleware";
import { getAllUsers, deleteUser, blockUser, getStats } from "../controllers/admin.controller";

const router = express.Router();

// 👑 ONLY ADMIN ROUTES
router.get("/users", protect, restrictTo("ADMIN"), getAllUsers);
router.delete("/user/:id", protect, restrictTo("ADMIN"), deleteUser);
router.patch("/user/block/:id", protect, restrictTo("ADMIN"), blockUser);
router.get("/stats", protect, restrictTo("ADMIN"), getStats); // ✅ stats route

export default router;