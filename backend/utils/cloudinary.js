import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import createHttpError from "http-errors";

export const imageUploadUtil = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      resource_type: "auto",
      folder: "fixithub",
      remove_exif: true, // Remove EXIF metadata
      quality: "auto",
      fetch_format: "auto",
    });

    return result;
  } catch (error) {
    throw createHttpError(500, "Failed to upload image.");
  }
};

const storage = new multer.memoryStorage();
export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("image");
