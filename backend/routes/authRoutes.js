import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  apiLimiter,
  authLimiter,
  sensitiveActionLimiter,
} from "./../middlewares/rateLimiter.js";
import {
  login,
  logout,
  register,
  verifyOTP,
  resendOTP,
  refreshToken,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";

const router = express.Router();

// ===================================================
//                 REGISTRATION FLOW
// ===================================================
router.post("/register", authLimiter, register); // 🛡️ Rate limited

// ===================================================
//                  VERIFICATION FLOW
// ===================================================
router.post("/verify-otp", apiLimiter, verifyOTP); // 🔄 Standard API rate limit
router.post("/resend-otp", sensitiveActionLimiter, resendOTP); // 🛡️ Strict rate limit

// ===================================================
//                  AUTHENTICATION
// ===================================================
router.post("/login", authLimiter, login); // 🛡️ Rate limited
router.post("/refresh-token", apiLimiter, refreshToken); // 🔄 Standard limit

// ===================================================
//                 PASSWORD MANAGEMENT
// ===================================================
router.post("/forgot-password", sensitiveActionLimiter, forgotPassword); // 🛡️ Strict limit
router.post("/reset-password", sensitiveActionLimiter, resetPassword); // 🛡️ Strict limit

// ===================================================
//                  SESSION MANAGEMENT
// ===================================================
router.post("/logout", protect, logout); // 🔒 Requires valid JWT

export default router;
