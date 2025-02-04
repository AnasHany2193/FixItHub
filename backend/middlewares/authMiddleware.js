import jwt from "jsonwebtoken";
import User from "../models/User.js";
import createHttpError from "http-errors";

export const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer "))
    throw createHttpError(401, "Unauthorized - No token provided");

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    throw createHttpError(401, "Unauthorized - Invalid token");
  }
};

export const roleCheck = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    throw createHttpError(403, "Forbidden - Insufficient permissions");
  }
  next();
};

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
