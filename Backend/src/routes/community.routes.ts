import express from "express";
import { upload } from "../middleware/upload.middleware";
import { protect } from "../middleware/auth.middleware";
import { Post } from "../models/Post.model";

const router = express.Router();

// ✅ CREATE POST
router.post(
  "/",
  protect,
  upload.single("image"),
  async (req: any, res) => {
    try {
      const { caption } = req.body;
      const post = await Post.create({
        caption,
        image: req.file ? req.file.path : "",
        userId: req.user.id,
      });

      const populatedPost = await Post.findById(post._id).populate(
        "userId",
        "name avatar location"
      );

      res.json({ success: true, data: populatedPost });
    } catch (err: any) {
      console.log(err);
      res.status(500).json({ message: err.message });
    }
  }
);

// ✅ GET ALL POSTS
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("userId", "name avatar location")
      .populate("comments.userId", "name avatar") // ✅ populate comment users too
      .sort({ createdAt: -1 });

    res.json({ success: true, data: posts });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ ADD COMMENT — yeh route missing tha
router.post("/comment", protect, async (req: any, res) => {
  try {
    const { postId, text } = req.body;

    if (!postId || !text?.trim()) {
      return res.status(400).json({ message: "postId aur text dono required hain" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post nahi mila" });
    }

    // Model mein field ka naam "content" hai, "text" nahi
    post.comments.push({
      userId: req.user.id,
      content: text.trim(),
      createdAt: new Date(),
    } as any);

    await post.save();

    // Populate karke return karo taaki frontend pe name/avatar mile
    const updatedPost = await Post.findById(postId).populate(
      "comments.userId",
      "name avatar"
    );

    const savedComment = updatedPost!.comments[updatedPost!.comments.length - 1];

    res.json({ success: true, data: savedComment });
  } catch (err: any) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});
router.post("/:id/like", protect, async (req: any, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post nahi mila" });
    }

    // 🔥 FIX: ObjectId compare properly
    const alreadyLiked = post.likes?.some(
      (id: any) => id.toString() === userId
    );

    if (alreadyLiked) {
      // ❌ UNLIKE
      post.likes = post.likes.filter(
        (id: any) => id.toString() !== userId
      );
    } else {
      // ✅ LIKE
      post.likes.push(userId);
    }

    await post.save();

    res.json({
      success: true,
      liked: !alreadyLiked,
      totalLikes: post.likes.length,
    });
  } catch (err: any) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});

export default router;