import express from "express";

import { protect, roleCheck } from "../middlewares/authMiddleware.js";
import { validateReview } from "../middlewares/reviewValidation.js";
import {
  createWorkerReview,
  createProductReview,
  updateReview,
  deleteReview,
  getReviews,
} from "../controllers/reviewController.js";

const router = express.Router();

router.post("/workers", protect, roleCheck("customer"), createWorkerReview);
router.post("/products", protect, roleCheck("customer"), createProductReview);

router.delete("/:reviewId", protect, roleCheck("customer"), deleteReview);
router.put(
  "/:reviewId",
  protect,
  roleCheck("customer"),
  validateReview,
  updateReview
);

router.get("/workers/:workerId", getReviews("WorkerReview"));
router.get("/products/:productId", getReviews("ProductReview"));

export default router;
