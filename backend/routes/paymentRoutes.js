import express from "express";

import { protect, roleCheck } from "./../middlewares/authMiddleware.js";
import {
  createProductPaymentIntent,
  createRepairPaymentIntent,
  paymentResponseFormatter,
} from "../controllers/paymentController.js";

const router = express.Router();

// Customer payment initiation
router.post(
  "/create-repair-payment-intent",
  paymentResponseFormatter,
  protect,
  roleCheck("customer"),
  createRepairPaymentIntent
);

router.post(
  "/create-product-payment-intent",
  paymentResponseFormatter,
  protect,
  roleCheck("customer"),
  createProductPaymentIntent
);

export default router;
