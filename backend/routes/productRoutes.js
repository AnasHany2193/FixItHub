import express from "express";

// Import middlewares
import { protect, roleCheck } from "../middlewares/authMiddleware.js";
import { validateImageUrls } from "../middlewares/productValidation.js";
import {
  apiLimiter,
  publicLimiter,
  productCreateLimiter,
  productUpdateLimiter,
} from "../middlewares/rateLimiter.js";

// Import controllers
import {
  updateStock,
  reserveStock,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  trackProductView,
  getProductDetails,
  getWorkerProducts,
  getSimilarProducts,
} from "../controllers/productController.js";

const router = express.Router();

// ===================================================
//                 WORKER MANAGEMENT
// ===================================================

/**
 * @desc    Create new product listing
 * @route   POST /api/v1/products
 * @access  Private (Approved Worker)
 */
router.post(
  "/",
  productCreateLimiter, // 🛡️ 5 requests/15m
  protect,
  roleCheck("worker"),
  validateImageUrls,
  createProduct
);

/**
 * @desc    Update existing product
 * @route   PATCH /api/v1/products/:id
 * @access  Private (Product Owner)
 */
router.patch(
  "/:id",
  productUpdateLimiter, // 🛡️ 10 requests/15m
  protect,
  roleCheck("worker"),
  validateImageUrls,
  updateProduct
);

/**
 * @desc    Delete product and reservations
 * @route   DELETE /api/v1/products/:id
 * @access  Private (Product Owner)
 */
router.delete("/:id", protect, roleCheck("worker"), deleteProduct);

// ===================================================
//                  INVENTORY CONTROL
// ===================================================
/**
 * @desc    Get worker's product listings
 * @route   GET /api/v1/products/worker
 * @access  Private (Worker)
 */
router.get(
  "/worker",
  protect,
  roleCheck("worker"),
  apiLimiter, // 🔄 100 requests/15m
  getWorkerProducts
);

/**
 * @desc    Update product stock levels
 * @route   PATCH /api/v1/products/:id/stock
 * @access  Private (Product Owner)
 */
router.patch(
  "/:id/stock",
  protect,
  roleCheck("worker"),
  productUpdateLimiter,
  updateStock
);

// ===================================================
//                  CUSTOMER ACTIONS
// ===================================================

/**
 * @desc    Reserve product stock
 * @route   POST /api/v1/products/:id/reservations
 * @access  Private (Customer)
 */
router.post(
  "/:id/reservations",
  protect,
  roleCheck("customer"),
  apiLimiter,
  reserveStock
);

// ===================================================
//                   PUBLIC ACCESS
// ===================================================

/**
 * @desc    Search products with filters
 * @route   GET /api/v1/products
 * @access  Public
 */
router.get(
  "/",
  publicLimiter, // 🌐 500 requests/h
  searchProducts
);

/**
 * @desc    Get similar products
 * @route   GET /api/v1/products/:id/similar
 * @access  Public
 */
router.get("/:id/similar", publicLimiter, getSimilarProducts);

/**
 * @desc    Get product details with view tracking
 * @route   GET /api/v1/products/:id
 * @access  Public
 */
router.get("/:id", publicLimiter, trackProductView, getProductDetails);
export default router;
