// controllers/upload.js
import { imageUploadUtil } from "../utils/imageUploadUtil.js";

export const handleImageUpload = async (req, res) => {
  try {
    // Multi-Image Upload Support
    if (!req.files?.length) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded. Please provide an image.",
      });
    }

    // Process all files
    const results = await Promise.all(
      req.files.map(async (file) => {
        const b64 = Buffer.from(file.buffer).toString("base64");
        const url = `data:${file.mimetype};base64,${b64}`;
        return await imageUploadUtil(url);
      })
    );

    res.status(200).json({
      success: true,
      message: "Uploaded",
      imageUrls: results.map((r) => r.secure_url), // Return Cloudinary URL
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error uploading image",
      error: error.message,
    });
  }
};
