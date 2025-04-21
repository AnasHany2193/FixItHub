import express from "express";

import { protect, roleCheck } from "./../middlewares/authMiddleware.js";
import {
  createProductPaymentIntent,
  paymentResponseFormatter,
  createRepairPaymentSession,
} from "../controllers/paymentController.js";

const router = express.Router();

router.post(
  "/payment/create-checkout-session",
  protect,
  createRepairPaymentSession
);

// ===================================================
//                 PAYMENT INITIATION
// ===================================================

/**
 * @desc    Create product purchase payment intent
 * @route   POST /api/v1/payments/product
 * @access  Private (Customer)
 */
router.post(
  "/product",
  protect,
  roleCheck("customer"),
  paymentResponseFormatter,
  createProductPaymentIntent
);

export default router;
