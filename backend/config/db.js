import mongoose from "mongoose";
import dotenv from "dotenv";

/**
 * Database Connection Manager
 * @returns {Promise<void>} Connects to MongoDB
 */

const connectDB = async () => {
  const MONGO_URI = process.env.MONGO_URI;

  if (!MONGO_URI) {
    console.error("🔴 MongoDB URI not found in environment variables");
    process.exit(1);
  }

  const connectionOptions = {
    dbName: "fixithub",
    autoIndex: process.env.NODE_ENV === "development",
    bufferCommands: false, // Disable mongoose buffering
    serverSelectionTimeoutMS: 5000,
    heartbeatFrequencyMS: 10000,
  };

  try {
    const conn = await mongoose.connect(MONGO_URI, connectionOptions);
    console.log(`🟢 MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.db.databaseName}`);
    console.log(`⏱️  Connection time: ${Date.now() - conn.start}ms`);
  } catch (error) {
    console.error("🔴 MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

// Database event listeners
mongoose.connection.on("disconnected", () => {
  console.log("🔴 MongoDB connection closed");
});

mongoose.connection.on("error", (err) => {
  console.error("🔴 MongoDB Error:", err.message);
});

// Graceful shutdown
const shutdownDB = async () => {
  await mongoose.disconnect();
  console.log("🛑 MongoDB connection closed gracefully");
};

process.on("SIGINT", shutdownDB);
process.on("SIGTERM", shutdownDB);

// Configure mongoose
mongoose.set("strictQuery", true);
mongoose.set("runValidators", true);

export default connectDB;
