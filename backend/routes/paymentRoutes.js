import express from "express";

import { protect, roleCheck } from "./../middlewares/authMiddleware.js";
import {
  createProductPaymentIntent,
  createRepairPaymentIntent,
  paymentResponseFormatter,
} from "../controllers/paymentController.js";

const router = express.Router();

// ===================================================
//                 PAYMENT INITIATION
// ===================================================

/**
 * @desc    Create repair service payment intent
 * @route   POST /api/v1/payments/repair
 * @access  Private (Customer)
 */
// Customer payment initiation
router.post(
  "/repair",
  protect,
  roleCheck("customer"),
  paymentResponseFormatter,
  createRepairPaymentIntent
);

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
