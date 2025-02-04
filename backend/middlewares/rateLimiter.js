import rateLimit from "express-rate-limit";

// General rate limiter (for all endpoints)
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per window
  message: "Too many requests. Try again later.",
});

// Strict rate limiter (for OTP/password endpoints)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Max 5 attempts
  message: "Too many attempts. Try again later.",
});

// Password reset limiter (prevent spam)
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Max 3 requests/hour
  message: "Too many password reset requests. Wait 1 hour.",
});
