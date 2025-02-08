// routes/uploadRoutes.js
import express from "express";
import { upload } from "../utils/imageUploadUtil.js";
import { handleImageUpload } from "../controllers/upload.js";
import { generalLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();
router.post("/upload", generalLimiter, upload, handleImageUpload);

export default router;
