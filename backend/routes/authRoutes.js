import express from "express";

// Controllers
import {
  register,
  verifyOTP,
  login,
  logout,
  resendOTP,
  refreshToken,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.js";

// Middlewares
import { protect } from "../middlewares/authMiddleware.js";
import {
  authLimiter,
  generalLimiter,
  passwordResetLimiter,
} from "../middlewares/rateLimiter.js";

const router = express.Router();

// Apply general limiter to all auth routes
router.use(generalLimiter);

// Route for user registration
router.post("/register", authLimiter, register);

router.post("/verify-otp", authLimiter, verifyOTP);
router.post("/resend-otp", authLimiter, resendOTP);

// Route for user login
router.post("/login", authLimiter, login);
router.post("/refresh-token", refreshToken);

router.post("/reset-password", passwordResetLimiter, resetPassword);
router.post("/forgot-password", passwordResetLimiter, forgotPassword);

// Route for user logout
router.post("/logout", protect, logout);

export default router;
