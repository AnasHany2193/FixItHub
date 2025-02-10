import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";

import connectDB from "./config/db.js"; // Import the DB connection function
import errorHandler from "./middlewares/errorHandler.js"; // Import the error handler

import "./utils/auctionScheduler.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import repairRoutes from "./routes/repairRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import auctionRoutes from "./routes/auctionRoutes.js";

import { handleStripeWebhook } from "./controllers/paymentController.js";

dotenv.config(); // Load environment variables

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

app.post(
  "/api/v1/payment/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

// Middleware
app.use(express.json()); // To parse JSON data from requests
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use(helmet());
app.use(helmet.permittedCrossDomainPolicies());

// Add logging for debugging
app.use(morgan("dev")); // 📝 Log requests

// Routes
app.get("/", (_, res) => {
  res.send("Hello, 𝕬𝖓𝖔𝖔𝖘 🖤! Welcome to FixItHub Project 🚀");
});
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date() });
});
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/repairs", repairRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/document", uploadRoutes);
app.use("/api/v1/auctions", auctionRoutes);

// Error handling middleware should be added last
app.use(errorHandler);

// Start Server
const startServer = async () => {
  try {
    await connectDB(); // Connect to the database
    app.listen(PORT, () => {
      console.log(
        `🟢 Hello, 𝕬𝖓𝖔𝖔𝖘 🖤! Server is running on http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error("Failed to start the server:", error.message);
    process.exit(1); // Exit with failure code
  }
};

startServer();
