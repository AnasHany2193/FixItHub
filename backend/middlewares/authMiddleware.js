import jwt from "jsonwebtoken";
import createHttpError from "http-errors";

import User from "../models/User.js";

export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer "))
    return next(createHttpError(401, "Unauthorized - No token provided"));

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.userId).select("+tokenVersion"); // ✅ Include tokenVersion
    if (!user) return next(createHttpError(401, "User not found"));

    if (user.status !== "active") {
      let errorMessage = "Account deactivated";
      if (user.status === "banned")
        errorMessage = "Account banned. Contact support.";
      if (user.status === "pending") errorMessage = "Account pending approval";

      return next(createHttpError(403, errorMessage));
    }

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

export const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return next(
      createHttpError(
        403,
        "Administrator privileges required for this action",
        { code: "ADMIN_ACCESS_DENIED" }
      )
    );
  }
  next();
};
