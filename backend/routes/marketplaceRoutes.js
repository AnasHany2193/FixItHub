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
} from "../controllers/marketplaceCustomerController.js";
import { protect, roleCheck } from "../middlewares/authMiddleware.js";

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
router.route("/products").get(getProducts);
router.route("/products/:id").get(getProductDetails);

export default router;
