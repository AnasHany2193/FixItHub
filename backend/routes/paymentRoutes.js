import express from "express";
import { protect } from "./../middlewares/authMiddleware.js";
import {
  handleStripeWebhook,
  createRepairPaymentIntent,
} from "../controllers/payment.js";

const router = express.Router();

// Webhook needs raw body
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

// Customer payment initiation
router.post("/create-payment-intent", protect, createRepairPaymentIntent);

export default router;
