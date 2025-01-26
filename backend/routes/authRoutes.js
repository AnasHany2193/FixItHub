import express from "express";

import {
  login,
  logout,
  register,
  getCurrentUser,
} from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Route for user registration
router.post("/register", register);

// Route for user login
router.post("/login", login);

// Route for user logout
router.get("/logout", logout);

// Route for get user data
router.get("/me", authMiddleware, getCurrentUser);

export default router;
