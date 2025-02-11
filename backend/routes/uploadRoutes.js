// routes/uploadRoutes.js
import express from "express";

import { upload } from "../utils/imageUploadUtil.js";
import { generalLimiter } from "../middlewares/rateLimiter.js";

import { handleImageUpload } from "../controllers/uploadController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Uploads
 *     description: Secure file upload management
 */
router.post("/upload", generalLimiter, upload, handleImageUpload);

/**
 * @swagger
 * /document/upload:
 *   post:
 *     $ref: './docs/swagger.yaml#/paths/~1document~1upload/post'
 */
export default router;
