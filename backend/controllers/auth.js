import jwt from "jsonwebtoken";
import createHttpError from "http-errors";

import User from "../models/User.js";

// Handle new user registration, hash password, and save it to the database.
export const register = async (req, res, next) => {
  const { username, email, password, role } = req.body;

  try {
    // Check need to be admin
    if (role === "admin") throw createHttpError(401, "Nice Try :)");

    // Check if the user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }], // Check for email OR username
    });
    if (existingUser)
      throw createHttpError(409, "Email or username already registered");

    // Create unverified user
    const user = await User.create({
      username,
      email,
      password,
      role: role || "customer",
    });

    // Generate OTP (example utility)
    const otp = generateOTP();
    // TODO: Store OTP in DB with expiration

    // Send verification email
    await sendEmail({
      to: email,
      subject: "Verify Your Email",
      text: `Your OTP is ${otp}`,
    });

    res.status(201).json({
      success: true,
      message: "Registration successful. Check email for verification.",
    });
  } catch (err) {
    next(err); // Pass the error to the error handler middleware
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

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    });

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

// Get the currently logged-in user
export const getCurrentUser = async (req, res, next) => {
  try {
    // Ensure req.user exists (set by authMiddleware)
    if (!req.user) {
      const error = new Error("No user is logged in.");
      error.statusCode = 401; // Unauthorized
      return next(error);
    }

    // Send the user details back as a response
    res.status(200).json({
      success: true,
      user: req.user, // req.user is populated by authMiddleware
    });
  } catch (error) {
    next(error); // Pass any errors to the global error handler
  }
};
