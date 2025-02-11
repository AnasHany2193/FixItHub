import rateLimit from "express-rate-limit";

// General rate limiter (for all endpoints)
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per window
  message: "Too many requests. Try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

// Strict rate limiter (for OTP/password endpoints)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Max 5 attempts

  message: {
    success: false,
    error: "Too many attempts. Please try again after 15 minutes.",
  },
  validate: { trustProxy: true }, // If using reverse proxy
  keyGenerator: (req) => `${req.ip}-${req.body?.email}`, // Combine IP + email
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

export const adminActionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: "Too many admin actions. Please slow down.",
  standardHeaders: true,
  legacyHeaders: false,
});
