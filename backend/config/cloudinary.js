import { v2 as cloudinary } from "cloudinary";
import createHttpError from "http-errors";

// Validate environment variables first
const requiredConfig = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

const missingVars = requiredConfig.filter((key) => !process.env[key]);
if (missingVars.length > 0)
  throw createHttpError(
    500,
    `Cloudinary configuration error: Missing ${missingVars.join(", ")} in environment variables`
  );

// Configure Cloudinary instance
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Connection verification with error handling
cloudinary.api
  .ping()
  .then(() => console.log("🟢 Cloudinary connection verified"))
  .catch((error) => {
    console.error("🔴 Cloudinary connection failed:", error.message);
    throw createHttpError.ServiceUnavailable("Cloudinary service unavailable", {
      details: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  });

export default cloudinary;
