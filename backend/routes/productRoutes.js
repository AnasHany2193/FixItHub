import express from "express";
import { protect, roleCheck } from "./../middlewares/authMiddleware.js";
import { createProduct } from "../controllers/product.js";

const router = express.Router();

// Protected routes: Only authenticated users can create, update, or delete products
// Only customers can create a product
router.post("/", protect, roleCheck(["customer"]), createProduct);

export default router;
