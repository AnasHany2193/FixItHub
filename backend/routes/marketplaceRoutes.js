import express from "express";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getMyProducts,
} from "../controllers/marketplaceWorkerController.js";
import { protect } from "./../middlewares/authMiddleware.js";
import {
  getProducts,
  getProductDetails,
} from "../controllers/marketplaceCustomerController.js";

const router = express.Router();

// Worker routes
router
  .route("/worker")
  .get(protect, roleCheck("worker"), getMyProducts)
  .post(protect, roleCheck("worker"), createProduct);

router
  .route("/worker/:id")
  .put(protect, roleCheck("worker"), updateProduct)
  .delete(protect, roleCheck("worker"), deleteProduct);

// Public customer routes
router.route("/").get(getProducts);
router.route("/:id").get(getProductDetails);

export default router;
