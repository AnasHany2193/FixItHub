// Error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error(err); // Log the error for debugging

  // Default status and message for server errors
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Respond with the error message and status code
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default errorHandler;
