import express from "express";

import { protect, roleCheck } from "../middlewares/authMiddleware.js";
import {
  getRepairRequest,
  listRepairRequests,
  updateRepairRequest,
  deleteRepairRequest,
  createRepairRequest,
} from "../controllers/repairRequest.js";

const router = express.Router();

router
  .route("/")
  .get(protect, roleCheck(["customer"]), listRepairRequests)
  .post(protect, roleCheck(["customer"]), createRepairRequest);

router
  .route("/:id")
  .get(protect, roleCheck(["customer"]), getRepairRequest)
  .put(protect, roleCheck(["customer"]), updateRepairRequest)
  .delete(protect, roleCheck(["customer"]), deleteRepairRequest);

export default router;
