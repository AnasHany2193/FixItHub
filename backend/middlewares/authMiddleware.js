import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Middleware to authenticate the user
export const authMiddleware = async (req, res, next) => {
  const token =
    req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    const error = new Error("No token provided. Please log in. 123");
    error.statusCode = 401;
    return next(error); // Passing the error to the global error handler
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password"); // Attach the user data to the request
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    error.statusCode = 401;
    error.message = "Invalid token. Please log in again.";
    return next(error); // Passing the error to the global error handler
  }
};
