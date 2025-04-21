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
} from "../controllers/repairController.js";
import {
  getAuctionDetails,
  getOpenAuctions,
  submitBid,
  updateBid,
} from "../controllers/auctionController.js";

const router = express.Router();

// ====================================================
//                   Customer Routes
// ====================================================
// Customer manages their repairs
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

// Customer auction management
router.post(
  "/:id/auction",
  protect,
  roleCheck("customer"),
  sensitiveActionLimiter,
  startRepairAuction
);
router.put("/:id/accept-bid", protect, roleCheck("customer"), acceptBid);
router.put("/:id/accept-offer", protect, roleCheck("customer"), acceptOffer);

// ====================================================
//                   Worker Routes
// ====================================================
// Worker browse opportunities
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
  "/direct-offers/:id",
  protect,
  roleCheck("worker"),
  getNonAuctionRepairDetails
);

// Worker bid/offer management
router.post("/auctions/:id/bids", protect, roleCheck("worker"), submitBid);
router.put("/bids/:id", protect, roleCheck("worker"), updateBid);
router.post(
  "/direct-offers/:id/offers",
  protect,
  roleCheck("worker"),
  submitOffer
);
router.put("/offers/:id", protect, roleCheck("worker"), updateOffer);

// Worker repair management
router.get(
  "/workers",
  protect,
  roleCheck("worker"),
  apiLimiter,
  getWorkerRepairs
);
router.patch(
  "/:id/complete",
  protect,
  roleCheck("worker"),
  sensitiveActionLimiter,
  completeRepair
);
router.patch(
  "/:id/return",
  protect,
  roleCheck("worker"),
  sensitiveActionLimiter,
  returnRepair
);
router.get(
  "/workers/history",
  protect,
  roleCheck("worker"),
  apiLimiter,
  getWorkerRepairsHistory
);

// ====================================================
//                 Workshop Routes
// ====================================================
router.put("/workshop/:id", protect, roleCheck("worker"), updateTrackingStatus);

export default router;
