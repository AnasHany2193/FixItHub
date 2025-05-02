import express from "express";

import {
  CustomerDashboardController,
  RepairHistoryController,
  MarketplaceActivityController,
  UserController,
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
router.get(
  "/repairs/history",
  protect,
  roleCheck("customer"),
  RepairHistoryController.getRepairHistory
);

router.get(
  "/marketplace/activity",
  protect,
  roleCheck("customer"),
  MarketplaceActivityController.getMarketplaceActivity
);

// User Profile Routes
router
  .route("/profile")
  .get(protect, UserController.getProfile)
  .patch(protect, UserController.updateProfile);

export default router;
