import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "community_posts",
    allowed_formats: ["jpg", "png", "jpeg"],
  } as object, // ✅ Fix: type cast to avoid 'folder' not in Params error
});

export const upload = multer({ storage });