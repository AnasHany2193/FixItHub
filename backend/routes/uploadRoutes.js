import express from "express";

import { upload } from "../utils/imageUploadUtil.js";
import { generalLimiter } from "../middlewares/rateLimiter.js";

import { handleImageUpload } from "../controllers/uploadController.js";

const router = express.Router();

router.post("/upload", generalLimiter, upload, handleImageUpload);

export default router;
