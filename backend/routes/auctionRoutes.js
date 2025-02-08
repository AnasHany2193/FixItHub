import express from "express";

import { protect, roleCheck } from "./../middlewares/authMiddleware.js";
import {
  listBids,
  acceptBid,
  submitBid,
  createAuction,
} from "../controllers/auctionController.js";

const router = express.Router();

// Customer routes
router.post("/", protect, roleCheck(["customer"]), createAuction);
router.put("/:id/accept-bid", protect, roleCheck(["customer"]), acceptBid);

// Worker/customer routes
router
  .route("/:id/bids")
  .get(protect, roleCheck(["customer", "worker"]), listBids)
  .post(protect, roleCheck(["worker"]), submitBid);

export default router;
