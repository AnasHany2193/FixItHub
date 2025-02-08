import multer from "multer";
import cloudinary from "../config/cloudinary.js";

export const imageUploadUtil = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      resource_type: "auto",
      remove_exif: true, // Remove EXIF metadata
      quality: "auto",
      fetch_format: "auto",
    });

    return result;
  } catch (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }
};

const storage = new multer.memoryStorage();
export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
}).array("images", 5); // Allow 5 files
