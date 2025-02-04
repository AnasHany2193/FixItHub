import express from "express";

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
} from "../controllers/auth.js";

// Middlewares
import {
  authMiddleware,
  protect,
  roleCheck,
} from "../middlewares/authMiddleware.js";
import { validateRegistration } from "../middlewares/validateRequest.js";

const router = express.Router();

// Route for user registration
router.post("/register", validateRegistration, register);

router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);

// Route for user login
router.post("/login", login);
router.post("/refresh-token", refreshToken);

// Example protected route (admin-only)
router.get("/admin/dashboard", protect, roleCheck(["admin"]), (req, res) => {
  res.json({ secretData: "Admin dashboard" });
});

router.post("/forgot-password", forgotPassword);

// Route for user logout
router.get("/logout", logout);

// Route for get user data
router.get("/me", authMiddleware, getCurrentUser);

export default router;
