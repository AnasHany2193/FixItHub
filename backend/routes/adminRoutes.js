import express from "express";

// Middlewares
import { protect, roleCheck } from "./../middlewares/authMiddleware.js";

// Controllers
import {
  getWorkerApplications,
  updateWorkerStatus,
} from "../controllers/admin.js";

const router = express.Router();

router.use(protect, roleCheck(["admin"]));

router.get("/workers/pending", getWorkerApplications);
router.put("/workers/:userId", updateWorkerStatus);

export default router;
