import express from "express";

import { protect, roleCheck } from "../middlewares/authMiddleware.js";
import {
  createRepairRequest,
  getRepairRequest,
} from "../controllers/repairRequest.js";

const router = express.Router();

router.route("/").post(protect, roleCheck(["customer"]), createRepairRequest);

router.route("/:id").get(protect, roleCheck(["customer"]), getRepairRequest);

export default router;
