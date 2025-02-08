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
  .post(protect, roleCheck(["customer", "worker"]), createProduct) // Allow workers to sell
  .get(listProducts); // Public access;

router
  .route("/:id")
  .get(getProductDetails) // Public access;
  .put(protect, roleCheck(["customer", "worker"]), updateProduct) // Workers can edit
  .delete(protect, roleCheck(["customer", "worker"]), deleteProduct);

export default router;
