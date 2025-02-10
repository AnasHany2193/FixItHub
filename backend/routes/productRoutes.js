import express from "express";
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
} from "../controllers/productController.js";
import { protect, roleCheck } from "../middlewares/authMiddleware.js";
import { validateImageUrls } from "../middlewares/productValidation.js";

const router = express.Router();

// Worker endpoints
router.post(
  "/",
  protect,
  roleCheck("worker"),
  validateImageUrls,
  createProduct
);

router.patch(
  "/:id",
  protect,
  roleCheck("worker"),
  validateImageUrls,
  updateProduct
);

router.delete("/:id", protect, roleCheck("worker"), deleteProduct);

router.get("/my-products", protect, roleCheck("worker"), getWorkerProducts);

// Public endpoints
router.get("/search", searchProducts);

router.post("/:id/reserve", protect, roleCheck("customer"), reserveStock);
router.patch("/:id/stock", protect, roleCheck("worker"), updateStock);

// Add route middleware
router.get("/:id", trackProductView, getProductDetails);

export default router;
