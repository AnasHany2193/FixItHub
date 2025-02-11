// routes/reportRoutes.js
import express from "express";
const router = express.Router();
import { protect } from "../middlewares/authMiddleware.js";
import { validateReport } from "../middlewares/reportValidation.js";
import {
  createReport,
  getUserReports,
  getReportDetails,
} from "../controllers/reportController.js";

// User endpoints
router.post("/", protect, validateReport, createReport);
router.get("/my-reports", protect, getUserReports);
router.get("/:id", protect, getReportDetails);

export default router;
