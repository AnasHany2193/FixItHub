import express from "express";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getWorkerProducts,
  searchProducts,
  reserveStock,
} from "../controllers/productController.js";
import { protect, roleCheck } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Worker endpoints
router.post("/", protect, roleCheck("worker"), createProduct);

router.patch("/:id", protect, roleCheck("worker"), updateProduct);

router.delete("/:id", protect, roleCheck("worker"), deleteProduct);

router.get("/my-products", protect, roleCheck("worker"), getWorkerProducts);

// Public endpoints
router.get("/search", searchProducts);

router.post("/:id/reserve", protect, roleCheck("customer"), reserveStock);

export default router;
