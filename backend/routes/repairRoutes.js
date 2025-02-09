import express from "express";
import {
  completeRepair,
  createRepairRequest,
  getRepairRequests,
  startRepair,
  updateRepairStatus,
  updateShippingStatus,
} from "../controllers/repairController.js";
import { protect, roleCheck } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect, roleCheck("customer"), createRepairRequest);

router.get("/", protect, roleCheck("customer"), getRepairRequests);

router.patch("/:id/status", protect, roleCheck("customer"), updateRepairStatus);

router.patch("/:id/start", protect, roleCheck("worker"), startRepair);

router.patch("/:id/complete", protect, roleCheck("worker"), completeRepair);

router.patch(
  "/:id/shipping",
  protect,
  roleCheck("worker"),
  updateShippingStatus
);

export default router;
