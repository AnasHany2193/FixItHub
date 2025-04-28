import express from "express";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getMyProducts,
} from "../controllers/marketplaceWorkerController.js";
import {
  getProducts,
  getProductDetails,
  addToFavorites,
  removeFromFavorites,
  getFavoriteProducts,
  getCart,
  addItemToCart,
  clearCart,
  updateCartItemQty,
  removeCartItem,
  getCustomerOrders,
  getOrderDetails,
} from "../controllers/marketplaceCustomerController.js";
import { protect, roleCheck } from "../middlewares/authMiddleware.js";
import { createOrderPaymentSession } from "../controllers/paymentController.js";

const router = express.Router();

// Worker routes
router
  .route("/worker/products")
  .get(protect, roleCheck("worker"), getMyProducts)
  .post(protect, roleCheck("worker"), createProduct);

router
  .route("/worker/products/:id")
  .put(protect, roleCheck("worker"), updateProduct)
  .delete(protect, roleCheck("worker"), deleteProduct);

// Public customer routes
router.route("/products").get(protect, roleCheck("customer"), getProducts);
router
  .route("/products/:id")
  .get(protect, roleCheck("customer"), getProductDetails);

// Favorite routes
router.post("/favorites", protect, roleCheck("customer"), addToFavorites);
router.delete(
  "/favorites/:productId",
  protect,
  roleCheck("customer"),
  removeFromFavorites
);
router.get("/favorites", protect, roleCheck("customer"), getFavoriteProducts);

// Cart Routes
router
  .route("/cart")
  .get(protect, roleCheck("customer"), getCart)
  .post(protect, roleCheck("customer"), addItemToCart)
  .delete(protect, roleCheck("customer"), clearCart);

router
  .route("/cart/:productId")
  .put(protect, roleCheck("customer"), updateCartItemQty)
  .delete(protect, roleCheck("customer"), removeCartItem);

// Order Routes
router.get("/orders", protect, roleCheck("customer"), getCustomerOrders);
router.get("/orders/:id", protect, roleCheck("customer"), getOrderDetails);

// Review Routes
router.post("/products/:productId/reviews", protect, addReview);
router.get("/products/:productId/reviews", getProductReviews);
router.put("/reviews/:reviewId", protect, updateReview);
router.delete("/reviews/:reviewId", protect, deleteReview);

// Payment Route
router.post(
  "/payment/create-checkout-session",
  protect,
  createOrderPaymentSession
);

export default router;
