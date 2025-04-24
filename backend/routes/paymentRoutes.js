import express from "express";

import { protect, roleCheck } from "./../middlewares/authMiddleware.js";
import {
  createProductPaymentIntent,
  paymentResponseFormatter,
} from "../controllers/paymentController.js";

const router = express.Router();

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
