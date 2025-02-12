import express from "express";

import { protect } from "../middlewares/authMiddleware.js";
import { apiLimiter } from "./../middlewares/rateLimiter.js";
import { validateReport } from "../middlewares/reportValidation.js";
import {
  createReport,
  getUserReports,
  getReportDetails,
} from "../controllers/reportController.js";

const router = express.Router();

// ===================================================
//                 REPORT SUBMISSION
// ===================================================

/**
 * @desc    Create new report
 * @route   POST /api/v1/reports
 * @access  Private (All users)
 */
router.post("/", apiLimiter, protect, validateReport, createReport);

// ===================================================
//                 REPORT QUERIES
// ===================================================

/**
 * @desc    Get user's submitted reports
 * @route   GET /api/v1/reports/my-reports
 * @access  Private (Report Owner)
 */
router.get(
  "/my-reports",
  apiLimiter, // 🔄 100 requests/15m
  protect,
  getUserReports
);

/**
 * @desc    Get report details
 * @route   GET /api/v1/reports/:id
 * @access  Private (Report Owner)
 */
router.get("/:id", apiLimiter, protect, getReportDetails);

export default router;
