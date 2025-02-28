import express from "express";
import { protect, roleCheck } from "../middlewares/authMiddleware.js";
import {
  apiLimiter,
  sensitiveActionLimiter,
} from "../middlewares/rateLimiter.js";
import {
  cancelAndReturnItem,
  cancelRepairRequest,
  completeRepair,
  createRepairRequest,
  getCustomerAuctions,
  getCustomerHistory,
  getRepairRequest,
  getRepairRequests,
  getWorkerHistory,
  getWorkerRepairs,
  startRepairAuction,
  updateRepairRequest,
  updateRepairStatus,
  updateShippingStatus,
} from "../controllers/repairController.js";

const router = express.Router();

// ===================================================
//                 CUSTOMER ROUTES
// ===================================================

/**
 * @desc    Create new repair request with auction
 * @route   POST /api/v1/repairs
 * @access  Private (Customer)
 */
router.post(
  "/",
  protect,
  roleCheck("customer"),
  sensitiveActionLimiter,
  createRepairRequest
);

router.post(
  "/:id/auction",
  protect,
  roleCheck("customer"),
  sensitiveActionLimiter,
  startRepairAuction
);

router.put(
  "/:id",
  protect,
  roleCheck("customer"),
  sensitiveActionLimiter,
  updateRepairRequest
);

/**
 * @desc    Get customer's active repair requests
 * @route   GET /api/v1/repairs
 * @access  Private (Customer)
 */
router.get("/", protect, roleCheck("customer"), apiLimiter, getRepairRequests);

router.get(
  "/:id",
  protect,
  roleCheck("customer"),
  apiLimiter,
  getRepairRequest
);

/**
 * @desc    Update repair request status
 * @route   PATCH /api/v1/repairs/:id/status
 * @access  Private (Customer)
 */
router.patch(
  "/:id/status",
  protect,
  roleCheck("customer"),
  sensitiveActionLimiter,
  updateRepairStatus
);

/**
 * @desc    Cancel repair request and auction
 * @route   PATCH /api/v1/repairs/:id/cancel
 * @access  Private (Customer)
 */
router.patch(
  "/:id/cancel",
  protect,
  roleCheck("customer"),
  sensitiveActionLimiter,
  cancelRepairRequest
);

/**
 * @desc    Get customer's active auctions
 * @route   GET /api/v1/repairs/auctions
 * @access  Private (Customer)
 */
router.get(
  "/auctions",
  protect,
  roleCheck("customer"),
  apiLimiter,
  getCustomerAuctions
);

/**
 * @desc    Get customer's repair history
 * @route   GET /api/v1/repairs/history
 * @access  Private (Customer)
 */
router.get(
  "/history",
  protect,
  roleCheck("customer"),
  apiLimiter,
  getCustomerHistory
);

// ===================================================
//                  WORKER ROUTES
// ===================================================

/**
 * @desc    Mark repair as completed
 * @route   PATCH /api/v1/repairs/:id/complete
 * @access  Private (Worker)
 */
router.patch(
  "/:id/complete",
  protect,
  roleCheck("worker"),
  sensitiveActionLimiter,
  completeRepair
);

/**
 * @desc    Update shipping status
 * @route   PATCH /api/v1/repairs/:id/shipping
 * @access  Private (Worker)
 */
router.patch(
  "/:id/shipping",
  protect,
  roleCheck("worker"),
  sensitiveActionLimiter,
  updateShippingStatus
);

/**
 * @desc    Get worker's active repairs
 * @route   GET /api/v1/repairs/worker
 * @access  Private (Worker)
 */
router.get(
  "/worker",
  protect,
  roleCheck("worker"),
  apiLimiter,
  getWorkerRepairs
);

/**
 * @desc    Get worker's repair history
 * @route   GET /api/v1/repairs/worker/history
 * @access  Private (Worker)
 */
router.get(
  "/worker/history",
  protect,
  roleCheck("worker"),
  apiLimiter,
  getWorkerHistory
);

/**
 * @desc    Initiate item return to customer
 * @route   PATCH /api/v1/repairs/:id/return
 * @access  Private (Worker)
 */
router.patch(
  "/:id/return",
  protect,
  roleCheck("worker"),
  sensitiveActionLimiter,
  cancelAndReturnItem
);

export default router;
