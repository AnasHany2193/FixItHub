// routes/uploadRoutes.js
import express from "express";
import { upload } from "../utils/imageUploadUtil.js";
import { handleImageUpload } from "../controllers/upload.js";

const router = express.Router();
router.post("/upload", upload, handleImageUpload);

export default router;
