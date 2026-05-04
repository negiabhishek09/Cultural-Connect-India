import { Request, Response } from "express";
import { User } from "../models/User.model";
import { Product } from "../models/Product.model";
import { Event } from "../models/Event.model";
import { ExploreItem } from "../models/ExploreItem.model";
import { Post } from "../models/Post.model";

// ✅ Get all users
export const getAllUsers = async (req: Request, res: Response) => {
  const users = await User.find();
  res.json({ users });
};

// ✅ Delete user
export const deleteUser = async (req: Request, res: Response) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted" });
};

// ✅ Block user
export const blockUser = async (req: Request, res: Response) => {
  await User.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ message: "User blocked" });
};

// ✅ Get stats
export const getStats = async (req: Request, res: Response) => {
  try {
    const [
      totalUsers,
      totalProducts,
      totalEvents,
      totalExploreItems,
      totalPosts,
      recentUsers,
    ] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Event.countDocuments({ isActive: true }),
      ExploreItem.countDocuments({ isActive: true }),
      Post.countDocuments(),
      User.find().sort({ createdAt: -1 }).limit(5).select('name email avatar createdAt role'),
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalProducts,
        totalEvents,
        totalExploreItems,
        totalPosts,
        recentUsers,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};