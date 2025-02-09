import express from "express";

import { protect, roleCheck } from "./../middlewares/authMiddleware.js";
import {
  acceptLowestBid,
  getAuctionBids,
  getAvailableAuctions,
  getOpenAuctions,
  submitBid,
} from "../controllers/auctionController.js";

const router = express.Router();

router.get("/open", protect, roleCheck("worker"), getOpenAuctions);

router.get("/available", protect, roleCheck("worker"), getAvailableAuctions);
router.post("/:auctionId/bids", protect, roleCheck("worker"), submitBid);
router.get("/:auctionId/bids", protect, getAuctionBids);
router.patch(
  "/:auctionId/accept",
  protect,
  roleCheck("customer"),
  acceptLowestBid
);

export default router;
