import express from "express";

import { protect, roleCheck } from "./../middlewares/authMiddleware.js";
import {
  apiLimiter,
  sensitiveActionLimiter,
} from "./../middlewares/rateLimiter.js";
import {
  submitBid,
  updateBid,
  getAuctionBids,
  acceptLowestBid,
  getAvailableAuctions,
} from "../controllers/auctionController.js";

const router = express.Router();

// ===================================================
//                  AUCTION LISTINGS
// ===================================================

/**
 * @desc    Get available auctions for workers
 * @route   GET /api/v1/auctions/available
 * @access  Private (Worker)
 */
router.get(
  "/available",
  protect,
  roleCheck("worker"),
  apiLimiter,
  getAvailableAuctions
);

// ===================================================
//                     BID FLOW
// ===================================================

/**
 * @desc    Submit new bid to auction
 * @route   POST /api/v1/auctions/:auctionId/bids
 * @access  Private (Worker)
 */
router.post(
  "/:auctionId/bids",
  protect,
  roleCheck("worker"),
  sensitiveActionLimiter,
  submitBid
);

/**
 * @desc    Update existing bid
 * @route   PATCH /api/v1/auctions/:auctionId/bids/:bidId
 * @access  Private (Worker)
 */
router.patch(
  "/:auctionId/bids/:bidId",
  protect,
  roleCheck("worker"),
  sensitiveActionLimiter,
  updateBid
);

/**
 * @desc    Get all bids for an auction
 * @route   GET /api/v1/auctions/:auctionId/bids
 * @access  Private (Customer/Worker)
 */
router.get("/:auctionId/bids", protect, apiLimiter, getAuctionBids);

// ===================================================
//                 AUCTION MANAGEMENT
// ===================================================

/**
 * @desc    Accept lowest bid and start repair process
 * @route   POST /api/v1/auctions/:auctionId/accept
 * @access  Private (Customer)
 */
router.post(
  "/:auctionId/accept",
  protect,
  roleCheck("customer"),
  sensitiveActionLimiter,
  acceptLowestBid
);

export default router;
