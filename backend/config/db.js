import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// MongoDB URI from .env file
const MONGO_URI = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI);
    console.log(`🟢 MongoDB Connected: ${conn.connection.host}`);

    // Add event listeners
    mongoose.connection.on("disconnected", () =>
      console.log("🔴 MongoDB disconnected")
    );
    mongoose.connection.on("error", (err) =>
      console.error("🔴 MongoDB connection error:", err)
    );
  } catch (error) {
    console.error("🔴 MongoDB Connection Error:", error.message);
    process.exit(1); // Exit process if there's an error
  }
};

// Handle Mongoose deprecation warnings
mongoose.set("strictQuery", true);

export default connectDB;
