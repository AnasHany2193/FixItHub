import express from "express";
import dotenv from "dotenv";
dotenv.config();

export const ENV = process.env.NODE_ENV;
export const PORT = process.env.PORT || 3000;

const app = express();

app.get("/", (_, res) => {
  res.send("Hello, 𝕬𝖓𝖔𝖔𝖘 🖤! Welcome to FixItHub Project 🚀");
});

app.listen(PORT, () => {
  console.log(
    `🟢 Hello, 𝕬𝖓𝖔𝖔𝖘 🖤! Server is running on http://localhost:${PORT}`
  );
});
