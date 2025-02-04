import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import express from "express";

import connectDB from "./config/db.js"; // Import the DB connection function
import errorHandler from "./middlewares/errorHandler.js"; // Import the error handler

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

dotenv.config(); // Load environment variables

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json()); // To parse JSON data from requests

app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use(helmet());
app.use(helmet.permittedCrossDomainPolicies());

// Routes
app.get("/", (_, res) => {
  res.send("Hello, 𝕬𝖓𝖔𝖔𝖘 🖤! Welcome to FixItHub Project 🚀");
});
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date() });
});
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/document", uploadRoutes);

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
