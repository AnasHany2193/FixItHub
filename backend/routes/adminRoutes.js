import express from "express";
const router = express.Router();

import { adminActionLimiter, apiLimiter } from "../middlewares/rateLimiter.js";
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
  getReportDetails,
} from "../controllers/adminController.js";

// ===================================================
//                 USER MANAGEMENT
// ===================================================

/**
 * @desc    List users with filters
 * @route   GET /api/v1/admin/users
 * @access  Private (Admin)
 */
router.get(
  "/users",
  protect,
  requireAdmin,
  apiLimiter, // 🔄 100 requests/15m
  listUsers
);

/**
 * @desc    Get user details
 * @route   GET /api/v1/admin/users/:userId
 * @access  Private (Admin)
 */
router.get("/users/:userId", protect, requireAdmin, apiLimiter, getUserDetails);

/**
 * @desc    Update user status
 * @route   PATCH /api/v1/admin/users/:userId/status
 * @access  Private (Admin)
 */
router.patch(
  "/users/:userId/status",
  protect,
  requireAdmin,
  adminActionLimiter, // 🛡️ 10 actions/hour
  updateUserStatus
);

// ===================================================
//                 WORKER APPLICATIONS
// ===================================================

/**
 * @desc    Get worker applications
 * @route   GET /api/v1/admin/applications
 * @access  Private (Admin)
 */
router.get(
  "/applications",
  protect,
  requireAdmin,
  apiLimiter,
  getWorkerApplications
);

/**
 * @desc    Process worker application
 * @route   PATCH /api/v1/admin/applications/:userId
 * @access  Private (Admin)
 */
router.patch(
  "/applications/:userId",
  protect,
  requireAdmin,
  adminActionLimiter,
  processApplication
);

// ===================================================
//                 REPORT MANAGEMENT
// ===================================================

/**
 * @desc    List reports
 * @route   GET /api/v1/admin/reports
 * @access  Private (Admin)
 */
router.get("/reports", protect, requireAdmin, apiLimiter, getReports);

/**
 * @desc    Get report details
 * @route   GET /api/v1/admin/reports/:id
 * @access  Private (Admin)
 */
router.get("/reports/:id", protect, requireAdmin, apiLimiter, getReportDetails);

/**
 * @desc    Update report status
 * @route   PATCH /api/v1/admin/reports/:id/status
 * @access  Private (Admin)
 */
router.patch(
  "/reports/:id/status",
  protect,
  requireAdmin,
  adminActionLimiter,
  updateReportStatus
);

/**
 * @desc    Take action on report
 * @route   POST /api/v1/admin/reports/:id/actions
 * @access  Private (Admin)
 */
router.post(
  "/reports/:id/actions",
  protect,
  requireAdmin,
  adminActionLimiter,
  takeReportAction
);

export default router;
