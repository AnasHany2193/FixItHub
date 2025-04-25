import express from "express";
import { protect, roleCheck } from "../middlewares/authMiddleware.js";
import {
  apiLimiter,
  sensitiveActionLimiter,
} from "../middlewares/rateLimiter.js";
import {
  cancelRepairRequest,
  completeRepair,
  createRepairRequest,
  getCustomerHistory,
  getRepairRequest,
  getRepairRequests,
  getWorkerRepairs,
  startRepairAuction,
  updateRepairRequest,
  acceptBid,
  getNonAuctionRepairs,
  getNonAuctionRepairDetails,
  submitOffer,
  updateOffer,
  acceptOffer,
  updateTrackingStatus,
  getWorkerRepairsHistory,
  returnRepair,
  getWorkerRepair,
} from "../controllers/repairController.js";
import {
  getAuctionDetails,
  getOpenAuctions,
  submitBid,
  updateBid,
} from "../controllers/auctionController.js";
import { createRepairPaymentSession } from "../controllers/paymentController.js";

const router = express.Router();

// ====================================================
//                   Worker Routes (Defined First)
// ====================================================
// Worker-specific routes with unique paths
router.get(
  "/workers",
  protect,
  roleCheck("worker"),
  apiLimiter,
  getWorkerRepairs
);
router.get(
  "/workers/active/:id",
  protect,
  roleCheck("worker"),
  apiLimiter,
  getWorkerRepair
);
router.get(
  "/workers/history",
  protect,
  roleCheck("worker"),
  apiLimiter,
  getWorkerRepairsHistory
);
router.get(
  "/auctions",
  protect,
  roleCheck("worker"),
  apiLimiter,
  getOpenAuctions
);
router.get(
  "/auctions/:id",
  protect,
  roleCheck("worker"),
  apiLimiter,
  getAuctionDetails
);
router.get(
  "/direct-offers",
  protect,
  roleCheck("worker"),
  getNonAuctionRepairs
);
router.get(
  "/non-auctions/:id",
  protect,
  roleCheck("worker"),
  getNonAuctionRepairDetails
);

// Worker actions with unique paths
router.post(
  "/auctions/:auctionId/bids",
  protect,
  roleCheck("worker"),
  submitBid
);
router.put("/bids/:bidId", protect, roleCheck("worker"), updateBid);
router.post(
  "/non-auctions/:repairId/offers",
  protect,
  roleCheck("worker"),
  submitOffer
);
router.put("/offers/:offerId", protect, roleCheck("worker"), updateOffer);
router.patch(
  "/complete/:repairId",
  protect,
  roleCheck("worker"),
  sensitiveActionLimiter,
  completeRepair
);
router.patch(
  "/return/:repairId",
  protect,
  roleCheck("worker"),
  sensitiveActionLimiter,
  returnRepair
);
router.put(
  "/tracking/:repairId",
  protect,
  roleCheck("worker"),
  updateTrackingStatus
);

// ====================================================
//                   Customer Routes (Defined After)
// ====================================================
// Customer routes with ID parameters
router.get("/", protect, roleCheck("customer"), apiLimiter, getRepairRequests);
router.post(
  "/",
  protect,
  roleCheck("customer"),
  sensitiveActionLimiter,
  createRepairRequest
);
router.get(
  "/history",
  protect,
  roleCheck("customer"),
  apiLimiter,
  getCustomerHistory
);
router.post(
  "/payment/create-checkout-session",
  protect,
  createRepairPaymentSession
);
router.get(
  "/:id",
  protect,
  roleCheck("customer"),
  apiLimiter,
  getRepairRequest
);
router.put(
  "/:id",
  protect,
  roleCheck("customer"),
  sensitiveActionLimiter,
  updateRepairRequest
);
router.patch(
  "/:id/cancel",
  protect,
  roleCheck("customer"),
  sensitiveActionLimiter,
  cancelRepairRequest
);
router.post(
  "/:id/auction",
  protect,
  roleCheck("customer"),
  sensitiveActionLimiter,
  startRepairAuction
);
router.put("/:repairId/accept-bid", protect, roleCheck("customer"), acceptBid);
router.put("/:id/accept-offer", protect, roleCheck("customer"), acceptOffer);

export default router;
