import jwt from "jsonwebtoken";
import createHttpError from "http-errors";
import User from "../models/User.js";

/**
 * @desc    Authentication middleware
 * @returns {Function} Middleware function that verifies JWT and sets req.user
 */
export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer "))
    return next(createHttpError(401, "Authentication required"));

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.userId).select("+tokenVersion");

    if (!user) return next(createHttpError(401, "User account not found"));

    if (user.status !== "active") {
      const messages = {
        banned: "Account suspended. Contact support for assistance.",
        pending: "Account pending verification",
        deactivated: "Account deactivated",
      };
      return next(
        createHttpError(403, messages[user.status] || "Account restricted")
      );
    }

    if (decoded.tokenVersion !== user.tokenVersion)
      return next(createHttpError(401, "Session expired. Please log in again"));

    req.user = user;
    next();
  } catch (err) {
    next(createHttpError(401, "Invalid authentication credentials"));
  }
};

/**
 * @desc    Role-based access control
 * @param   {string[]} roles - Allowed user roles
 * @returns {Function} Middleware function that checks user role
 */
export const roleCheck = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return next(
      createHttpError(403, `Access restricted to: ${roles.join(", ")} accounts`)
    );

  next();
};

/**
 * @desc    Admin-only access middleware
 * @returns {Function} Middleware that restricts access to admin users
 */
export const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return next(
      createHttpError(
        403,
        "Administrative privileges required for this operation"
      )
    );
  }
  next();
};
