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
} from "../controllers/adminController.js";
import { protect, roleCheck } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All routes protected by admin
router.use(protect, roleCheck("admin"));

router.get("/users", getUsersByRole);
router.get("/users/:id", getUserDetails);
router.patch("/users/:id/status", updateUserStatus);
router.patch("/users/:id/worker-approval", approveOrRejectWorker);
router.get("/logs", getAdminLogs);

router.get("/repairs", protect, roleCheck("admin"), getAllRepairs);
router.get("/repairs/:id", protect, roleCheck("admin"), getRepairDetails);
router.patch(
  "/repairs/:id/reset-auction",
  protect,
  roleCheck("admin"),
  resetAuction
);
router.delete("/repairs/:id", protect, roleCheck("admin"), deleteRepair);
router.patch("/repairs/:id/cancel", protect, roleCheck("admin"), cancelRepair);
router.patch(
  "/repairs/:id/close-auction",
  protect,
  roleCheck("admin"),
  closeAuction
);

export default router;
