import express from "express";

import { protect } from "../middlewares/authMiddleware.js";
import {
  getMyProfile,
  updateMyProfile,
  getAllWorkers,
  getAllCustomers,
  getUserProfile,
} from "../controllers/userController.js";

const router = express.Router();

// Current User Profile
router.get("/me", protect, getMyProfile);
router.patch("/me", protect, updateMyProfile);

// Public User Access
router.get("/:id", protect, getUserProfile);
router.get("/workers", protect, getAllWorkers);
router.get("/customers", protect, getAllCustomers);

export default router;
