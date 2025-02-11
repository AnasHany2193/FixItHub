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

router.get("/me", protect, getMyProfile);

router.patch("/me", protect, updateMyProfile);

router.get("/:id", protect, getUserProfile);

router.get("/workers", protect, getAllWorkers);

router.get("/customers", protect, getAllCustomers);

export default router;
