import express from "express";

import { protect, roleCheck } from "../middlewares/authMiddleware.js";
import { validateImageUrls } from "../middlewares/productValidation.js";
import {
  productCreateLimiter,
  productUpdateLimiter,
} from "../middlewares/rateLimiter.js";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getWorkerProducts,
  searchProducts,
  reserveStock,
  trackProductView,
  getProductDetails,
  updateStock,
  getSimilarProducts,
} from "../controllers/productController.js";

const router = express.Router();

// Worker endpoints
router.post(
  "/",
  productCreateLimiter,
  protect,
  roleCheck("worker"),
  validateImageUrls,
  createProduct
);

router.patch(
  "/:id",
  productUpdateLimiter,
  protect,
  roleCheck("worker"),
  validateImageUrls,
  updateProduct
);

router.delete("/:id", protect, roleCheck("worker"), deleteProduct);

router.get("/my-products", protect, roleCheck("worker"), getWorkerProducts);

router.patch("/:id/stock", protect, roleCheck("worker"), updateStock);
router.post("/:id/reserve", protect, roleCheck("customer"), reserveStock);

// Public endpoints
router.get("/search", searchProducts);
router.get("/:id/similar", getSimilarProducts);
router.get("/:id", trackProductView, getProductDetails);

export default router;
