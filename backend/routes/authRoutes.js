import express from "express";

import { upload } from "../utils/imageUploadUtil.js";

// Controllers
import {
  register,
  verifyOTP,
  login,
  logout,
  getCurrentUser,
  resendOTP,
  refreshToken,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.js";

// Middlewares
import { protect, roleCheck } from "../middlewares/authMiddleware.js";
import {
  validatePassword,
  validateRegistration,
  validateWorkerRegistration,
} from "../middlewares/validateRequest.js";
import {
  authLimiter,
  generalLimiter,
  passwordResetLimiter,
} from "../middlewares/rateLimiter.js";

const router = express.Router();

// Apply general limiter to all auth routes
router.use(generalLimiter);

// Route for user registration
router.post(
  "/register",
  upload,
  validateRegistration,
  validatePassword,
  validateWorkerRegistration,
  register
);

router.post("/verify-otp", authLimiter, verifyOTP);
router.post("/resend-otp", resendOTP);

// Route for user login
router.post("/login", authLimiter, login);
router.post("/refresh-token", refreshToken);

// Example protected route (admin-only)
router.get("/admin/dashboard", protect, roleCheck(["admin"]), (req, res) => {
  res.json({ secretData: "Admin dashboard" });
});

router.post("/forgot-password", forgotPassword);
router.post(
  "/reset-password",
  validatePassword,
  passwordResetLimiter,
  resetPassword
);

// Route for user logout
router.post("/logout", protect, logout);

export default router;
