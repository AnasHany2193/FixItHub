import express from "express";

import { protect, requireAdmin } from "../middlewares/authMiddleware.js";
import {
  adminActionLimiter,
  apiLimiter,
} from "./../middlewares/rateLimiter.js";
import {
  getMyProfile,
  updateMyProfile,
  getAllWorkers,
  getAllCustomers,
  getUserProfile,
} from "../controllers/userController.js";

const router = express.Router();

// Authenticated routes
router.get("/:id", protect, getUserProfile);
router.get("/workers", protect, apiLimiter, getAllWorkers);

router.get("/me", protect, apiLimiter, getMyProfile);
router.patch("/me", protect, apiLimiter, updateMyProfile);

// Admin-only routes
router.get(
  "/customers",
  protect,
  requireAdmin,
  adminActionLimiter,
  getAllCustomers
);

export default router;
