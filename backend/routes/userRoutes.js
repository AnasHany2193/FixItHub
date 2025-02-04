import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { getCurrentUser } from "../controllers/user.js";

const router = express.Router();
router.get("/me", protect, getCurrentUser);

export default router;
