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
} from "../controllers/authController.js";

// Middlewares
import { protect } from "../middlewares/authMiddleware.js";
import {
  authLimiter,
  sensitiveActionLimiter,
} from "./../middlewares/rateLimiter.js";

const router = express.Router();

router.post("/register", authLimiter, register);

router.post("/verify-otp", verifyOTP);

router.post("/resend-otp", resendOTP);

router.post("/login", authLimiter, login);

router.post("/refresh-token", refreshToken);

router.post("/reset-password", resetPassword);

router.post("/forgot-password", sensitiveActionLimiter, forgotPassword);

router.post("/logout", protect, logout);

export default router;
