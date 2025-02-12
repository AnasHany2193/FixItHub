import rateLimit from "express-rate-limit";

const isProduction = process.env.NODE_ENV === "production";

// Generic rate limiting configuration
const baseConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => !isProduction, // Disable in development
  handler: (req, res, next) =>
    next(createHttpError(429, "Too many requests. Try again later.")),
};

// Authentication-related endpoints
export const authLimiter = rateLimit({
  ...baseConfig,
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 20 : 100,
  keyGenerator: (req) => `${req.ip}-${req.path}`,
  message: "Too many authentication attempts. Try again later.",
});

// Sensitive operations
export const sensitiveActionLimiter = rateLimit({
  ...baseConfig,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: isProduction ? 5 : 20,
  keyGenerator: (req) => `${req.user?._id || req.ip}-${req.path}`,
  message: "Too many sensitive operations requested. Try again later.",
});

// API endpoints
export const apiLimiter = rateLimit({
  ...baseConfig,
  max: isProduction ? 100 : 500,
  skip: (req) => req.user?.role === "admin",
  message: "Too many API requests. Please slow down.",
});

// Admin operations
export const adminActionLimiter = rateLimit({
  ...baseConfig,
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  keyGenerator: (req) => req.user._id,
  message: "Too many administrative actions. Please slow down.",
});

// Public endpoints
export const publicLimiter = rateLimit({
  ...baseConfig,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: isProduction ? 500 : 2000,
  message: "Too many requests from this source. Try again later.",
});

// General rate limiter (for all endpoints)
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per window
  message: "Too many requests. Try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

// Password reset limiter (prevent spam)
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Max 3 requests/hour
  message: {
    success: false,
    error: "Too many password reset attempts. Try again in 1 hour.",
  },
  skip: (req) => req.user?.isVerified, // Allow verified users more attempts
});

// Add bid submission limiter
export const bidLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 bids per worker per auction
  keyGenerator: (req) => `${req.user._id}-${req.params.id}`,
  message: "Too many bid attempts. Try again later.",
  standardHeaders: true,
});

export const productCreateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: "Too many product listings created. Try again later.",
});

export const productUpdateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many product updates. Try again later.",
});
