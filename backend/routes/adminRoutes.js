import express from "express";
const router = express.Router();

import { adminActionLimiter } from "../middlewares/rateLimiter.js";
import { protect, requireAdmin } from "../middlewares/authMiddleware.js";

import {
  listUsers,
  getUserDetails,
  updateUserStatus,
  processApplication,
  getWorkerApplications,
  getReports,
  updateReportStatus,
  takeReportAction,
} from "../controllers/adminController.js";

// User Management
router.get("/users", protect, requireAdmin, adminActionLimiter, listUsers);
router.get("/users/:userId", protect, requireAdmin, getUserDetails);
router.patch(
  "/users/:userId/status",
  protect,
  requireAdmin,
  adminActionLimiter,
  updateUserStatus
);

// Worker Applications
router.get("/applications", protect, requireAdmin, getWorkerApplications);
router.patch(
  "/applications/:userId",
  protect,
  requireAdmin,
  adminActionLimiter,
  processApplication
);

router.get("/reports", protect, requireAdmin, adminActionLimiter, getReports);
router.patch(
  "/reports/:id",
  protect,
  requireAdmin,
  adminActionLimiter,
  updateReportStatus
);
router.post(
  "/reports/:id/actions",
  protect,
  requireAdmin,
  adminActionLimiter,
  takeReportAction
);

export default router;
