import express from "express";
import {
  createRepairRequest,
  getRepairRequests,
  updateRepairStatus,
} from "../controllers/repairController.js";
import { protect, roleCheck } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect, roleCheck("customer"), createRepairRequest);

router.get("/", protect, roleCheck("customer"), getRepairRequests);

router.patch("/:id/status", protect, roleCheck("customer"), updateRepairStatus);

export default router;
