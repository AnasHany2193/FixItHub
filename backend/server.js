import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js"; // Import the DB connection function

dotenv.config();

export const ENV = process.env.NODE_ENV;
export const PORT = process.env.PORT || 3000;

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json()); // To parse JSON data from requests

// Routes
app.get("/", (_, res) => {
  res.send("Hello, 𝕬𝖓𝖔𝖔𝖘 🖤! Welcome to FixItHub Project 🚀");
});

// Start server
app.listen(PORT, () => {
  console.log(
    `🟢 Hello, 𝕬𝖓𝖔𝖔𝖘 🖤! Server is running on http://localhost:${PORT}`
  );
});
