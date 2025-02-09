import express from "express";

import { protect, roleCheck } from "./../middlewares/authMiddleware.js";
import { createRepairPaymentIntent } from "../controllers/paymentController.js";

const router = express.Router();

// Customer payment initiation
router.post(
  "/create-payment-intent",
  protect,
  roleCheck("customer"),
  createRepairPaymentIntent
);

export default router;
