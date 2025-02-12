import jwt from "jsonwebtoken";
import createHttpError from "http-errors";
import User from "../models/User.js";

/**
 * @desc    Authentication middleware - Verifies JWT and sets req.user
 * @returns {Function} Middleware function
 * @throws  {401} Unauthorized - Invalid/missing token
 * @throws  {403} Forbidden - Account restricted
 */
export const protect = async (req, res, next) => {
  // Check both Authorization header and cookies
  const token = req.headers.authorization?.split(" ")[1] || req.cookies?.token;

  if (!token) return next(createHttpError(401, "Authentication required"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // Get user with token version check
    const user = await User.findById(decoded.userId)
      .select("+tokenVersion +status +role")
      .lean();

    if (!user) return next(createHttpError(401, "User account not found"));

    // Account status checks
    const statusMessages = {
      banned: "Account suspended. Contact support for assistance.",
      pending: "Account pending verification",
      deactivated: "Account deactivated",
    };

    if (user.status !== "active")
      return next(
        createHttpError(
          403,
          statusMessages[user.status] || "Account restricted"
        )
      );

    // Token version validation
    if (decoded.tokenVersion !== user.tokenVersion)
      return next(
        createHttpError(401, "Session expired. Please reauthenticate")
      );

    // Set user context
    req.user = user;
    next();
  } catch (err) {
    next(createHttpError(401, "Invalid authentication credentials"));
  }
};

/**
 * @desc    Role-based access control middleware
 * @param   {string[]} allowedRoles - Array of permitted roles
 * @returns {Function} Middleware function
 * @throws  {403} Forbidden - Insufficient permissions
 */
export const roleCheck = (allowedRoles) => (req, res, next) => {
  if (!allowedRoles.includes(req.user.role))
    return next(
      createHttpError(403, `Requires ${allowedRoles.join(" or ")} privileges`)
    );

  next();
};

/**
 * @desc    Admin-only access middleware
 * @returns {Function} Middleware function
 * @throws  {403} Forbidden - Non-admin access attempt
 */
export const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin")
    return next(
      createHttpError(
        403,
        "Administrative privileges required for this operation"
      )
    );

  next();
};
