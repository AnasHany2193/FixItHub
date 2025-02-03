import createHttpError from "http-errors";

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  // Log the error for debugging
  console.error(`[${new Date().toISOString()}] Error: ${err.message}`);

  // Handle JWT errors
  if (err.name === "UnauthorizedError")
    return res.status(401).json({ error: "Invalid or expired token" });

  // Handle Mongoose validation errors
  if (err.name === "ValidationError") {
    return res.status(400).json({ error: err.message });
  }

  // Handle HTTP errors
  if (err instanceof createHttpError.HttpError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Fallback: Generic server error
  res.status(500).json({ error: "Internal server error" });
};

export default errorHandler;
