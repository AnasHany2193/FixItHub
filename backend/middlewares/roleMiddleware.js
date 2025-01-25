// Middleware to check user roles
export const isAdmin = () => {
  return (req, res, next) => {
    // Check if the user is admin
    if (req.user?.role !== "admin") {
      const error = new Error(
        "Forbidden. You do not have the required permissions."
      );
      error.statusCode = 403; // Forbidden status
      return next(error); // Passing error to error handler
    }

    next(); // Allow access if role is admin
  };
};
