import express from "express";

import { apiLimiter } from "./../middlewares/rateLimiter.js";
import { validateReview } from "../middlewares/reviewValidation.js";
import { protect, roleCheck } from "../middlewares/authMiddleware.js";
import {
  createWorkerReview,
  createProductReview,
  updateReview,
  deleteReview,
  getReviews,
} from "../controllers/reviewController.js";

const router = express.Router();

// ===================================================
//                 REVIEW CREATION
// ===================================================
/**
 * @desc    Create worker review
 * @route   POST /api/v1/reviews/workers
 * @access  Private (Customer)
 */
router.post(
  "/workers",
  apiLimiter,
  protect,
  roleCheck("customer"),
  createWorkerReview
);

/**
 * @desc    Create product review
 * @route   POST /api/v1/reviews/products
 * @access  Private (Customer)
 */
router.post(
  "/products",
  apiLimiter,
  protect,
  roleCheck("customer"),
  createProductReview
);

// ===================================================
//                 REVIEW MANAGEMENT
// ===================================================

/**
 * @desc    Update existing review
 * @route   PUT /api/v1/reviews/:reviewId
 * @access  Private (Review Owner)
 */
router.put(
  "/:reviewId",
  protect,
  roleCheck("customer"),
  validateReview,
  updateReview
);

/**
 * @desc    Delete review
 * @route   DELETE /api/v1/reviews/:reviewId
 * @access  Private (Review Owner)
 */
router.delete("/:reviewId", protect, roleCheck("customer"), deleteReview);

// ===================================================
//                 PUBLIC REVIEW QUERIES
// ===================================================

/**
 * @desc    Get worker reviews
 * @route   GET /api/v1/reviews/workers/:workerId
 * @access  Public
 */
router.get("/workers/:workerId", apiLimiter, getReviews("WorkerReview"));

/**
 * @desc    Get product reviews
 * @route   GET /api/v1/reviews/products/:productId
 * @access  Public
 */
router.get("/products/:productId", apiLimiter, getReviews("ProductReview"));

export default router;
