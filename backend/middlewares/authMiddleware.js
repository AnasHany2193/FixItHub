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
    const user = await User.findById(decoded.userId).select("+tokenVersion"); // ✅ Include tokenVersion
    if (!user) return next(createHttpError(401, "User not found"));

    if (!user.status) return next(createHttpError(403, "Account deactivated"));

    if (decoded.tokenVersion !== user.tokenVersion)
      throw createHttpError(401, "Token revoked");

    req.user = user;
    next();
  } catch (err) {
    next(createHttpError(401, "Invalid token, please log in again"));
  }
};

export const roleCheck = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return next(createHttpError(403, "Forbidden - Insufficient permissions"));

  next();
};
