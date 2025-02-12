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
  getProducts,
  deleteProduct,
  getProductDetails,
  getRepairs,
  getRepairDetails,
  deleteRepair,
  adminDeleteReview,
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

// ===================================================
//                 PRODUCT MANAGEMENT
// ===================================================

/**
 * @desc    Get products
 * @route   GET /api/v1/admin/products
 * @access  Private (Admin)
 */
router.get("/products", protect, requireAdmin, apiLimiter, getProducts);

/**
 * @desc    Get product details
 * @route   GET /api/v1/admin/products/:id
 * @access  Private (Admin)
 */
router.get(
  "/products/:id",
  protect,
  requireAdmin,
  apiLimiter,
  getProductDetails
);

/**
 * @desc    Delete product
 * @route   DELETE /api/v1/admin/products/:id
 * @access  Private (Admin)
 */
router.delete(
  "/products/:id",
  protect,
  requireAdmin,
  adminActionLimiter,
  deleteProduct
);

// ===================================================
//                 REPAIR MANAGEMENT
// ===================================================

/**
 * @desc    Get repair requests
 * @route   GET /api/v1/admin/repairs
 * @access  Private (Admin)
 */
router.get("/repairs", protect, requireAdmin, apiLimiter, getRepairs);

/**
 * @desc    Get repair details
 * @route   GET /api/v1/admin/repairs/:id
 * @access  Private (Admin)
 */
router.get("/repairs/:id", protect, requireAdmin, apiLimiter, getRepairDetails);

/**
 * @desc    Delete repair request
 * @route   DELETE /api/v1/admin/repairs/:id
 * @access  Private (Admin)
 */
router.delete(
  "/repairs/:id",
  protect,
  requireAdmin,
  adminActionLimiter,
  deleteRepair
);

// ===================================================
//                 REVIEW MANAGEMENT
// ===================================================

/**
 * @desc    Delete review
 * @route   DELETE /api/v1/admin/reviews/:id
 * @access  Private (Admin)
 */
router.delete(
  "/reviews/:id",
  protect,
  requireAdmin,
  adminActionLimiter,
  adminDeleteReview
);
export default router;
