import express from "express";
import { register, login, logout } from "../controllers/authController.js";

const router = express.Router();

// Route for user registration
router.post("/register", register);

// Route for user login
router.post("/login", login);

// Route for user logout
router.get("/logout", logout);

export default router;
