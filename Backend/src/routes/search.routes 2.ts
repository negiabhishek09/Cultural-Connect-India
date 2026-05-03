import express from "express";
import { searchController } from "../controllers/search.controller";
import Place from "../models/Place.model";

const router = express.Router();

/**
 * 🔍 SEARCH ROUTE
 * GET /api/v1/search?q=keyword
 */
router.get(
  "/search",
  (req, res, next) => {
    const { q } = req.query;

    if (!q || typeof q !== "string" || q.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Search query (q) is required",
      });
    }

    next();
  },
  searchController
);

/**
 * 🧪 TEMP ROUTE (DATA INSERT)
 * GET /api/v1/add
 */
router.get("/add", async (req, res) => {
  try {
    const data = await Place.create({
      name: "Taj Mahal",
      description: "Famous monument in India",
    });

    res.status(201).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Insert failed",
    });
  }
});

export default router;