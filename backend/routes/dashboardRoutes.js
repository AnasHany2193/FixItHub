import express from "express";

import {
  CustomerDashboardController,
  RepairHistoryController,
  ActiveRepairsController,
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
  "/repairs/active",
  protect,
  roleCheck("customer"),
  ActiveRepairsController.getActiveRepairs
);
router.get(
  "/marketplace/activity",
  protect,
  roleCheck("customer"),
  MarketplaceActivityController.getMarketplaceActivity
);
router.get(
  "/marketplace/favorites",
  protect,
  roleCheck("customer"),
  MarketplaceActivityController.getFavoriteProducts
);

// User Profile Routes
router
  .route("/profile")
  .get(protect, UserController.getProfile)
  .patch(protect, UserController.updateProfile);

export default router;
