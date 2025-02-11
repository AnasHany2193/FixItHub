import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";

import connectDB from "./config/db.js"; // Import the DB connection function
import errorHandler from "./middlewares/errorHandler.js"; // Import the error handler

import "./jobs/auctionScheduler.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import repairRoutes from "./routes/repairRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import auctionRoutes from "./routes/auctionRoutes.js";
import productRoutes from "./routes/productRoutes.js";

import { handleStripeWebhook } from "./controllers/paymentController.js";
import { startReservationCleanup } from "./jobs/reservationCleanup.js";

dotenv.config(); // Load environment variables

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;
const v1Router = express.Router();

app.post(
  "/api/v1/payment/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

// Middleware
app.use(express.json()); // To parse JSON data from requests
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(helmet());
app.use(helmet.permittedCrossDomainPolicies());

// Add logging for debugging
app.use(morgan("dev")); // 📝 Log requests

// Routes
app.use("/api/v1", v1Router);
app.get("/", (_, res) => {
  res.send("Hello, 𝕬𝖓𝖔𝖔𝖘 🖤! Welcome to FixItHub Project 🚀");
});
app.get("/api/v1/health", async (req, res) => {
  const dbStatus =
    mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  res.status(200).json({ status: "OK", db: dbStatus });
});
v1Router.use("/auth", authRoutes);
v1Router.use("/users", userRoutes);
v1Router.use("/admin", adminRoutes);
v1Router.use("/reviews", reviewRoutes);
v1Router.use("/reports", reportRoutes);
v1Router.use("/repairs", repairRoutes);
v1Router.use("/payment", paymentRoutes);
v1Router.use("/document", uploadRoutes);
v1Router.use("/auctions", auctionRoutes);
v1Router.use("/products", productRoutes);

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
startReservationCleanup();
