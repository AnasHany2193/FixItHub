// imageUploadUtil.js
import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import createHttpError from "http-errors";
import { fileTypeFromBuffer } from "file-type";

// Allowed MIME types and extensions
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"]);

/**
 * @desc    Secure image upload to Cloudinary with validation
 * @param   {string} file - Data URI of the file
 * @param   {Object} [options] - Upload options
 * @returns {Promise<Object>} Cloudinary upload result
 * @throws  {BadRequest} For invalid files
 * @throws  {BadGateway} For Cloudinary errors
 */
export const imageUploadUtil = async (file) => {
  try {
    // Validate file signature
    const buffer = Buffer.from(file.split(",")[1], "base64");
    const type = await fileTypeFromBuffer(buffer);

    if (!type || !ALLOWED_TYPES.has(type.mime))
      throw createHttpError.BadRequest(
        `Invalid file type. Allowed: ${[...ALLOWED_EXTENSIONS].join(", ")}`
      );

    return await cloudinary.uploader.upload(file, {
      resource_type: "image",
      folder: options.folder || "fixithub/public",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      format: "auto",
      quality: "auto:best",
      face_aware_optimization: true,
      invalidate: true,
      remove_exif: true,
      ...options,
    });
  } catch (error) {
    if (error instanceof createHttpError.HttpError) throw error;
    throw createHttpError.BadGateway("Image upload service unavailable", {
      originalError: error.message,
    });
  }
};

// Configure multer with enhanced validation
const storage = new multer.memoryStorage();
export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5,
  },
  fileFilter: async (req, file, cb) => {
    try {
      // Validate file content
      const buffer = file.buffer;
      const type = await fileTypeFromBuffer(buffer);

      if (!type || !ALLOWED_TYPES.has(type.mime))
        return cb(
          createHttpError.BadRequest(
            `Invalid file type. Allowed: ${[...ALLOWED_EXTENSIONS].join(", ")}`
          )
        );

      cb(null, true);
    } catch (error) {}
    cb(createHttpError.BadRequest("Invalid file content"));
  },
}).array("images");
