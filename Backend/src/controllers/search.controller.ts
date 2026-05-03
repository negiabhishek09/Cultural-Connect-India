import { Request, Response } from "express";
import Place from "../models/Place.model";


export const searchController = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;

    // ✅ Validation
    if (!q || typeof q !== "string" || q.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    // ✅ DB search (multi-field better)
    const results = await Place.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ],
    });

    // ✅ Response format
    return res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });

  } catch (error) {
    console.error("Search Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};