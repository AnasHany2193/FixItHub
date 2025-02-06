import createHttpError from "http-errors";

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  // Log the error for debugging
  console.error(`[ERROR] ${err.stack}`); // Log full stack trace

  if (process.env.NODE_ENV === "production") delete err.stack; // Hide stack in production

  // Handle Mongoose ValidationError
  if (err.name === "ValidationError") {
    const errorMessages = Object.values(err.errors).map(
      (error) => error.message
    );
    // Send each error message separately
    errorMessages.forEach((message) => {
      return res.status(400).json({
        success: false,
        error: `Validation failed: ${message}`,
      });
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
