import express from "express";
import { protect, roleCheck } from "./../middlewares/authMiddleware";
import { createProduct } from "../controllers/product";

const router = express.Router();
router.post("/", protect, roleCheck(["seller"]), createProduct);

export default router;
