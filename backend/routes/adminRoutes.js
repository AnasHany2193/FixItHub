import express from "express";
import {
  getUsersByRole,
  getUserDetails,
  updateUserStatus,
  approveOrRejectWorker,
  getAdminLogs,
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

export default router;
