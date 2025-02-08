import express from "express";

import { submitRating } from "../controllers/rating.js";
import { protect } from "./../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect, submitRating);
export default router;
