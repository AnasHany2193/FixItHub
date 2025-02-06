import express from "express";
import { protect, roleCheck } from "./../middlewares/authMiddleware.js";
import {
  createProduct,
  deleteProduct,
  getProductDetails,
  listProducts,
  updateProduct,
} from "../controllers/product.js";

const router = express.Router();

router
  .route("/")
  .post(protect, roleCheck(["customer"]), createProduct) // Only customer
  .get(listProducts); // Public access;

router
  .route("/:id")
  .get(getProductDetails) // Public access;
  .put(protect, roleCheck(["customer"]), updateProduct) // Only sellers (registered as "customers") can update
  .delete(protect, roleCheck(["customer"]), deleteProduct); // Only sellers can delete

export default router;
