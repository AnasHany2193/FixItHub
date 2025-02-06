import jwt from "jsonwebtoken";
import User from "../models/User.js";
import createHttpError from "http-errors";

export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer "))
    return next(createHttpError(401, "Unauthorized - No token provided"));

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) return next(createHttpError(401, "User not found"));

    req.user = user;
    next();
  } catch (err) {
    next(createHttpError(401, "Invalid token, please log in again"));
  }
};

export const roleCheck = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    throw createHttpError(403, "Forbidden - Insufficient permissions");
  }
  next();
};
