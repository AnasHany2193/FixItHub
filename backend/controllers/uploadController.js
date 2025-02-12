import createHttpError from "http-errors";
import { imageUploadUtil } from "../utils/imageUploadUtil.js";

/**
 * @desc    Handle image uploads for any user
 * @route   POST /api/v1/upload
 * @access  Public
 * @param   {Object} req - Express request object with files
 * @param   {Object} res - Express response object
 * @param   {Function} next - Express next middleware
 * @returns {Object} JSON response with uploaded image URLs
 * @throws  {400} If no files are uploaded
 * @throws  {500} If image processing fails
 */
export const handleImageUpload = async (req, res) => {
  try {
    // Validate files exist in request
    if (!req.files?.length)
      throw createHttpError(400, "At least one image file required");

    // Process all files in parallel
    const uploadResults = await Promise.all(
      req.files.map(async (file) => {
        // Convert buffer to Base64 data URI
        const dataURI = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
        return imageUploadUtil(dataURI);
      })
    );

    // Send success response with image metadata
    res.status(200).json({
      success: true,
      count: uploadResults.length,
      urls: uploadResults.map((result) => ({
        url: result.secure_url,
        resourceType: result.resource_type,
        bytes: result.bytes,
      })),
      message: "Uploaded",
    });
  } catch (error) {
    // Pass error to Express error handler
    next(
      createHttpError(error.status || 500, error.message, {
        details: error.details,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      })
    );
  }
};
