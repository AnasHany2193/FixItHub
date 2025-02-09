import express from "express";

import { protect, roleCheck } from "./../middlewares/authMiddleware.js";
import {
  acceptBid,
  getAuctionBids,
  submitBid,
} from "../controllers/auctionController.js";

const router = express.Router();

// // Customer routes
// router.post("/", protect, roleCheck(["customer"]), createAuction);
// router.put("/:id/accept-bid", protect, roleCheck(["customer"]), acceptBid);

// // Worker/customer routes
// router
//   .route("/:id/bids")
//   .get(protect, roleCheck(["customer", "worker"]), listBids)
//   .post(protect, roleCheck(["worker"]), bidLimiter, submitBid);

router.post("/:repairId/bids", protect, roleCheck("worker"), submitBid);

router.patch(
  "/:repairId/accept-bid",
  protect,
  roleCheck("customer"),
  acceptBid
);

router.get("/:repairId/bids", protect, getAuctionBids);

export default router;
