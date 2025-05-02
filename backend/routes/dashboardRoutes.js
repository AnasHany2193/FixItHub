import express from "express";

import {
  CustomerDashboardController,
  UserController,
  WorkerDashboardController,
} from "../controllers/dashboardController.js";
import { protect, roleCheck } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Customer Dashboard Routes
router.get(
  "/summary",
  protect,
  roleCheck("customer"),
  CustomerDashboardController.getDashboardSummary
);

// routes/dashboardRoutes.js
router.get(
  "/worker",
  protect,
  roleCheck("worker"),
  WorkerDashboardController.getWorkerDashboard
);

// User Profile Routes
router
  .route("/profile")
  .get(protect, UserController.getProfile)
  .patch(protect, UserController.updateProfile);

export default router;
