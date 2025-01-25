import User from "../models/User.js";
import jwt from "jsonwebtoken";

// Handle new user registration, hash password, and save it to the database.
export const register = async (req, res, next) => {
  const { username, email, password } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error("User already exists!");
      error.statusCode = 400; // Bad Request
      throw error;
    }

    // Create a new user, password will be hashed in pre-save middleware
    const user = await User.create({
      username,
      email,
      password,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    next(error); // Pass the error to the error handler middleware
  }
};

// Check the credentials, compare the password, and generate a JWT token for the session.
export const login = async (req, res, next) => {
  const { username, password } = req.body;
  try {
    // Validate request body
    if (!username || !password) {
      const error = new Error("Username and password are required.");
      error.statusCode = 400; // Bad Request
      throw error;
    }

    const user = await User.findOne({ username });
    if (!user) {
      const error = new Error("User is not exists!");
      error.statusCode = 400; // Bad Request
      throw error;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const error = new Error("Invalid username or password.");
      error.statusCode = 401; // Unauthorized
      throw error;
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d",
      }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict", // Protect against CSRF attacks
      maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
    });

    res.status(200).json({
      token,
      success: true,
      message: "Logged in successfully",
    });
  } catch (error) {
    next(error); // Pass the error to the error handler middleware
  }
};

export const logout = async (req, res, next) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Match original cookie settings
      sameSite: "strict",
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully ツ",
    });
  } catch (error) {
    next(error); // Pass the error to the centralized error handler
  }
};
