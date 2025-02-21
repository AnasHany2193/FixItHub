import express from "express";

import { upload } from "../utils/cloudinary.js";
import { handleImageUpload } from "../controllers/uploadController.js";

const router = express.Router();

router.post("/", upload, handleImageUpload);

export default router;
