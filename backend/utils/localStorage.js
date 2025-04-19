import fs from "fs";
import path from "path";
import { v4 as uuid } from "uuid";
import createHttpError from "http-errors";

const BASE_URL = process.env.BASE_URL || "http://localhost:5000"; // adjust if needed

// Define uploads directory
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

export const localImageUpload = async (file) => {
  try {
    const ext = path.extname(file.originalname);
    const filename = `${uuid()}${ext}`;
    const filepath = path.join(uploadsDir, filename);

    fs.writeFileSync(filepath, file.buffer);

    const url = `${BASE_URL}/uploads/${filename}`; // Static public URL

    return {
      url,
      public_id: filename,
    };
  } catch (error) {
    throw createHttpError(500, "Failed to upload image locally.");
  }
};
