import { v2 as cloudinary } from "cloudinary";

/**
 * Cloudinary Configuration
 * @throws {Error} If required environment variables are missing
 */
const requiredVars = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

const missingVars = requiredVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0)
  throw new Error(
    `🔴 Cloudinary configuration failed. Missing: ${missingVars.join(", ")}`
  );

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Enforce HTTPS
});

// Verify configuration
cloudinary.api.ping((error) => {
  if (error) console.error("🔴 Cloudinary connection failed:", error.message);
  else console.log("🟢 Cloudinary connected successfully");
});

export default cloudinary;
