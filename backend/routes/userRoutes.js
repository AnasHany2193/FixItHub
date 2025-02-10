// routes/userRoutes.js
import express from "express";
const router = express.Router();
import { protect } from "../middlewares/authMiddleware.js";
import {
  getMyProfile,
  updateMyProfile,
  getAllWorkers,
  getAllCustomers,
  getUserProfile,
} from "../controllers/userController.js";
import { validateProfileUpdate } from "../middlewares/userValidation.js";

// Profile management
router.get("/me", protect, getMyProfile);
router.patch("/me", protect, validateProfileUpdate, updateMyProfile);

// Public profiles
router.get("/workers", protect, getAllWorkers);
router.get("/customers", protect, getAllCustomers);
router.get("/:id", protect, getUserProfile);

export default router;
