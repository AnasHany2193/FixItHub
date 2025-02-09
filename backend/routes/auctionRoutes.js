import express from "express";

import { protect, roleCheck } from "./../middlewares/authMiddleware.js";
import {
  acceptBid,
  getAuctionBids,
  getOpenAuctions,
  submitBid,
} from "../controllers/auctionController.js";

const router = express.Router();

router.post("/:repairId/bids", protect, roleCheck("worker"), submitBid);

router.patch(
  "/:repairId/accept-bid",
  protect,
  roleCheck("customer"),
  acceptBid
);

router.get("/:repairId/bids", protect, getAuctionBids);

router.get("/open", protect, roleCheck("worker"), getOpenAuctions);

export default router;
