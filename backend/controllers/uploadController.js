import createHttpError from "http-errors";
import { localImageUpload } from "../utils/localStorage.js";

export const handleImageUpload = async (req, res, next) => {
  try {
    if (!req.file)
      throw createHttpError(400, "No file uploaded. Please provide an image.");

    const result = await localImageUpload(req.file);

    res.status(200).json({
      result,
      success: true,
      message: "Image uploaded successfully",
    });
  } catch (error) {
    next(error);
  }
};
