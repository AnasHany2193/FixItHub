import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import createHttpError from "http-errors";

/**
 * @desc    Upload file to Cloudinary
 * @param   {string} file - Data URI of the file
 * @returns {Promise<Object>} Cloudinary upload result
 */
export const imageUploadUtil = async (file) => {
  try {
    return await cloudinary.uploader.upload(file, {
      resource_type: "auto",
      remove_exif: true,
      quality: "auto:best",
      fetch_format: "auto",
      invalidate: true,
    });
  } catch (error) {
    throw createHttpError.BadGateway("Cloudinary service unavailable", {
      originalError: error,
    });
  }
};

// Multer configuration
const storage = new multer.memoryStorage();
export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5,
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(createHttpError.BadRequest("Only image files allowed"));
    }
    cb(null, true);
  },
}).array("images");
