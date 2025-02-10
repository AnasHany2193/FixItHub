import express from "express";

// Import middlewares
import { protect, roleCheck } from "../middlewares/authMiddleware.js";
import { validateImageUrls } from "../middlewares/productValidation.js";
import {
  productCreateLimiter,
  productUpdateLimiter,
} from "../middlewares/rateLimiter.js";

// Import controllers
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

// Worker Product Management
router.post(
  "/",
  productCreateLimiter, // Rate limiting
  protect, // Authentication
  roleCheck("worker"), // Authorization
  validateImageUrls, // Image validation
  createProduct // Controller
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

// Worker Inventory
router.get("/my-products", protect, roleCheck("worker"), getWorkerProducts);
router.patch("/:id/stock", protect, roleCheck("worker"), updateStock);

// Customer Actions
router.post("/:id/reserve", protect, roleCheck("customer"), reserveStock);

// Public Access
router.get("/search", searchProducts);
router.get("/:id/similar", getSimilarProducts);
router.get(
  "/:id",
  trackProductView, // View tracking middleware
  getProductDetails // Main handler
);

export default router;
