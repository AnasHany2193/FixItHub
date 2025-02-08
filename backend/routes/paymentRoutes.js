import express from "express";
import { protect } from "./../middlewares/authMiddleware.js";
import { createRepairPaymentIntent } from "../controllers/payment.js";

const router = express.Router();

// Customer payment initiation
router.post("/create-payment-intent", protect, createRepairPaymentIntent);

export default router;
