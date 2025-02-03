import express from "express";

// Controllers
import {
  register,
  verifyOTP,
  login,
  logout,
  getCurrentUser,
} from "../controllers/auth.js";

// Middlewares
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { validateRegistration } from "../middlewares/validateRequest.js";

const router = express.Router();

// Route for user registration
router.post("/register", validateRegistration, register);

router.post("/verify-otp", verifyOTP);

// Route for user login
router.post("/login", login);

// Route for user logout
router.get("/logout", logout);

// Route for get user data
router.get("/me", authMiddleware, getCurrentUser);

export default router;
