import express from "express";
import {
  cancelAndReturnItem,
  cancelRepairRequest,
  completeRepair,
  createRepairRequest,
  getCustomerAuctions,
  getCustomerHistory,
  getRepairRequests,
  getWorkerHistory,
  getWorkerRepairs,
  startRepair,
  updateRepairStatus,
  updateShippingStatus,
} from "../controllers/repairController.js";
import { protect, roleCheck } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect, roleCheck("customer"), createRepairRequest);

router.get("/", protect, roleCheck("customer"), getRepairRequests);

router.patch("/:id/status", protect, roleCheck("customer"), updateRepairStatus);

router.patch(
  "/:id/cancel",
  protect,
  roleCheck("customer"),
  cancelRepairRequest
);

router.get("/auctions", protect, roleCheck("customer"), getCustomerAuctions);

router.get(
  "/customer/history",
  protect,
  roleCheck("customer"),
  getCustomerHistory
);

router.patch("/:id/start", protect, roleCheck("worker"), startRepair);

router.patch("/:id/complete", protect, roleCheck("worker"), completeRepair);

router.patch(
  "/:id/shipping",
  protect,
  roleCheck("worker"),
  updateShippingStatus
);

router.get("/worker", protect, roleCheck("worker"), getWorkerRepairs);

router.get("/worker/history", protect, roleCheck("worker"), getWorkerHistory);
router.patch(
  "/:id/cancel-and-return",
  protect,
  roleCheck("worker"),
  cancelAndReturnItem
);

export default router;
