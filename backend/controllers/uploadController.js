import createHttpError from "http-errors";
import { imageUploadUtil } from "../utils/cloudinary.js";

export const handleImageUpload = async (req, res, next) => {
  try {
    // Validate file exist in request
    if (!req.file)
      throw createHttpError(400, "No file uploaded. Please provide an image.");

    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const url = `data:${req.file.mimetype};base64,${b64}`;
    const result = await imageUploadUtil(url);

    // Send success response with image metadata
    res.status(200).json({
      result,
      success: true,
      message: "Image uploaded successfully",
    });
  } catch (error) {
    next(error);
  }
};
