import express from "express";

import { protect } from "../middlewares/authMiddleware.js";
import { apiLimiter } from "./../middlewares/rateLimiter.js";
import {
  getMyProfile,
  getUserProfile,
  updateMyProfile,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/me", protect, apiLimiter, getMyProfile);
router.patch("/me", protect, apiLimiter, updateMyProfile);
router.get("/:id", protect, apiLimiter, getUserProfile);

export default router;
