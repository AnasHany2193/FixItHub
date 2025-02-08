import multer from "multer";
import createHttpError from "http-errors";

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  // Log the error for debugging
  console.error(`[ERROR] ${err.stack}`); // Log full stack trace

  if (process.env.NODE_ENV === "production") delete err.stack; // Hide stack in production

  // MongoDB duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      success: false,
      error: `${field} already exists`,
    });
  }

  // Invalid JSON body
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      error: "Invalid JSON payload",
    });
  }

  // Handle Mongoose ValidationError
  if (err.name === "ValidationError")
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: err.message,
    });

  // Handle invalid ObjectId format (e.g., "123" instead of valid 24-character ID)
  if (err.name === "CastError")
    return res.status(400).json({
      success: false,
      error: "Invalid product ID format.",
    });

  if (err.name === "Error")
    return res.status(400).json({
      success: false,
      error: err.message,
    });

  if (err instanceof multer.MulterError) {
    // File upload errors
    return res.status(400).json({
      success: false,
      error: `File upload error: ${err.message}`,
    });
  }

  // Handle HTTP errors
  if (err instanceof createHttpError.HttpError)
    return res
      .status(err.statusCode)
      .json({ success: false, error: err.message });

  // Fallback: Generic server error
  res.status(500).json({ success: false, error: "Internal server error" });
};

export default errorHandler;
