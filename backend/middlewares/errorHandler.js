import multer from "multer";
import createHttpError from "http-errors";

/**
 * Central Error Handling Middleware
 * @description Handles all errors in a consistent format
 */
const errorHandler = (err, req, res, next) => {
  // Security: Obfuscate errors in production
  const isProduction = process.env.NODE_ENV === "production";

  // Structured error logging
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}`, {
    error: err.message,
    stack: isProduction ? undefined : err.stack,
    type: err.name || "UnknownError",
    user: req.user?.id || "anonymous",
  });

  // Standardized error response
  const response = {
    success: false,
    error: isProduction && !err.expose ? "Something went wrong" : err.message,
    ...(!isProduction && { details: err.details }),
  };

  // Handle specific error types
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      ...response,
      error: "Duplicate entry",
      details: isProduction ? undefined : `${field} already exists`,
    });
  }

  if (err.type === "entity.parse.failed")
    return res.status(400).json({
      ...response,
      error: "Invalid JSON",
    });

  if (err.name === "ValidationError")
    return res.status(400).json({
      ...response,
      error: "Validation failed",
      details: isProduction ? undefined : err.message,
    });

  if (err.name === "CastError")
    return res.status(400).json({
      ...response,
      error: "Invalid ID format",
    });

  if (err instanceof multer.MulterError)
    return res.status(err.code === "LIMIT_FILE_SIZE" ? 413 : 400).json({
      ...response,
      error: "File upload error",
      details: isProduction ? undefined : err.message,
    });

  if (err instanceof createHttpError.HttpError)
    return res.status(err.statusCode).json(response);

  if (err.name === "Error")
    return res.status(400).json({
      success: false,
      error: err.message,
    });

  // Fallback to generic error
  res.status(500).json({
    success: false,
    error: isProduction ? "Internal server error" : err.message,
    ...(!isProduction && { stack: err.stack }),
  });
};

export default errorHandler;
