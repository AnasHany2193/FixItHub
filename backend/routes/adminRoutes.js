import express from "express";
import {
  getUsersByRole,
  getUserDetails,
  updateUserStatus,
  approveOrRejectWorker,
  getAdminLogs,
  getAllRepairs,
  getRepairDetails,
  resetAuction,
  deleteRepair,
  cancelRepair,
  closeAuction,
  getAllProducts,
  getProductDetails,
  deleteProduct,
  getAllOrders,
  deleteOrder,
  getAllReviews,
  deleteReview,
  getRecentActivities,
  getAdminDashboardStats,
} from "../controllers/adminController.js";
import { protect, roleCheck } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All routes protected by admin
router.use(protect, roleCheck("admin"));

// Users
router.get("/users", getUsersByRole);
router.get("/users/:id", getUserDetails);
router.patch("/users/:id/status", updateUserStatus);
router.patch("/users/:id/worker-approval", approveOrRejectWorker);
router.get("/logs", getAdminLogs);

// Repairs
router.get("/repairs", getAllRepairs);
router.get("/repairs/:id", getRepairDetails);
router.patch("/repairs/:id/reset-auction", resetAuction);
router.delete("/repairs/:id", deleteRepair);
router.patch("/repairs/:id/cancel", cancelRepair);
router.patch(
  "/repairs/:id/close-auction",

  closeAuction
);

// Products
// adminProductRoutes.js
router.get("/products", getAllProducts);
router.get("/products/:id", getProductDetails);
router.delete("/products/:id", deleteProduct);

// adminOrderRoutes.js
router.get("/orders", getAllOrders);
router.delete("/orders/:id", deleteOrder);

// adminReviewRoutes.js
router.get("/reviews", getAllReviews);
router.delete("/reviews/:id", deleteReview);

router.get("/dashboard/stats", getAdminDashboardStats);

router.get("/dashboard/activities", getRecentActivities);

export default router;
