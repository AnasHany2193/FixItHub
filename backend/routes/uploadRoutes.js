import express from "express";

import { upload } from "../utils/imageUploadUtil.js";
import { apiLimiter } from "../middlewares/rateLimiter.js";
import { handleImageUpload } from "../controllers/uploadController.js";

const router = express.Router();

router.post("/upload", apiLimiter, upload, handleImageUpload);

export default router;
