import { imageUploadUtil } from "../utils/imageUploadUtil.js";

/**
 * @desc    Handle multiple image uploads
 * @route   POST /api/v1/document/upload
 * @access  Private
 */
export const handleImageUpload = async (req, res) => {
  try {
    if (!req.files?.length)
      throw createHttpError("400", "At least one image file required");

    const uploadResults = await Promise.all(
      req.files.map(async (file) => {
        const b64 = Buffer.from(file.buffer).toString("base64");
        const dataURI = `data:${file.mimetype};base64,${b64}`;
        return imageUploadUtil(dataURI);
      })
    );

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
    next(
      createHttpError(error.status || 500, error.message, {
        details: error.details,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      })
    );
  }
};
