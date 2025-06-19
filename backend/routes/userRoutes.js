import express from "express";

import { protect } from "../middlewares/authMiddleware.js";
import { apiLimiter } from "./../middlewares/rateLimiter.js";
import {
  getMyProfile,
  updateMyProfile,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/me", protect, apiLimiter, getMyProfile);
router.patch("/me", protect, apiLimiter, updateMyProfile);

export default router;
