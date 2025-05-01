import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import path from "path";

import connectDB from "./config/db.js";
import errorHandler from "./middlewares/errorHandler.js";
import { handleStripeWebhook } from "./controllers/paymentController.js";
import "./jobs/auctionScheduler.js";

// Route Imports
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import repairRoutes from "./routes/repairRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import marketplaceRoutes from "./routes/marketplaceRoutes.js";

// Load environment variables and Swagger docs
dotenv.config();

// Initialize Express application
const app = express();
const PORT = process.env.PORT || 5000;
const v1Router = express.Router();
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ======================
// Security Middlewares
// ======================
app.use(helmet());
app.use(
  helmet.permittedCrossDomainPolicies({
    permittedPolicies: "by-content-type",
  })
);

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  })
);
app.use(cookieParser());

// ======================
// Webhook Handling
// ======================
app.post(
  "/api/v1/payment/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

// ======================
// Request Parsing
// ======================
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// ======================
// Logging & Monitoring
// ======================
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

// ======================
// Health Check & Root Route
// ======================
v1Router.get("/health", async (req, res) => {
  const dbStatus =
    mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  res.status(200).json({
    status: "OK",
    db: dbStatus,
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
  });
});

app.get("/", (_, res) => {
  res.send(`
    <h1>FixItHub API Service</h1>
    <p>Hello, 𝕬𝖓𝖔𝖔𝖘 🖤! Welcome to FixItHub Backend System 🚀</p>
    <ul>
      <li><a href="/api/v1/health">Service Health</a></li>
    </ul>
  `);
});

// ======================
// API Routes
// ======================

const routeConfig = [
  { path: "/auth", route: authRoutes },
  { path: "/users", route: userRoutes },
  { path: "/upload", route: uploadRoutes },
  { path: "/repairs", route: repairRoutes },
  { path: "/marketplace", route: marketplaceRoutes },
  { path: "/dashboard", route: dashboardRoutes },
];

// Apply rate limiting and register routes
routeConfig.forEach(({ path, route }) => {
  v1Router.use(path, route);
});

app.use("/api/v1", v1Router);

// ======================
// Error Handling
// ======================
app.use(errorHandler);

// ======================
// Server Initialization
// ======================
const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`
        🚀 Server running in ${process.env.NODE_ENV || "development"} mode
        🔗 Base URL: http://localhost:${PORT}
      `);
    });

    // Graceful shutdown
    const shutdown = async () => {
      console.log("\n🛑 Received shutdown signal...");
      await mongoose.disconnect();
      server.close(() => {
        console.log("💤 Server process terminated");
        process.exit(0);
      });
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  } catch (error) {
    console.error("❌ Server startup failed:", error.message);
    process.exit(1);
  }
};

// ======================
// Start Application
// ======================
startServer();
