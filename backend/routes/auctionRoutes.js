import express from "express";

import { protect, roleCheck } from "./../middlewares/authMiddleware.js";
import {
  acceptLowestBid,
  getAuctionBids,
  getAvailableAuctions,
  submitBid,
  updateBid,
} from "../controllers/auctionController.js";

const router = express.Router();

router.get("/available", protect, roleCheck("worker"), getAvailableAuctions);
router.post("/:auctionId/bids", protect, roleCheck("worker"), submitBid);
router.get("/:auctionId/bids", protect, getAuctionBids);
router.patch(
  "/:auctionId/accept",
  protect,
  roleCheck("customer"),
  acceptLowestBid
);

router.put("/:auctionId/bids/:bidId", protect, roleCheck("worker"), updateBid);

export default router;
