import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary";



const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "community_posts",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

export const upload = multer({ storage });