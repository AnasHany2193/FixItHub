import jwt from "jsonwebtoken";
import createHttpError from "http-errors";

import OTP from "../models/OTP.js";
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
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP

    // Save hashed OTP to DB
    const otp = await OTP.create({
      userId: user._id,
      code: otpCode,
    });

    // Send verification email
    await sendEmail({
      to: email,
      subject: "Verify Your FixItHub Account",
      html: `<p>Your OTP is <strong>${otpCode}</strong>. It expires in 10 minutes.</p>`,
    });

    res.status(201).json({
      success: true,
      message: "Registration successful. Check email for OTP verification.",
    });
  } catch (err) {
    // Rollback user creation if email fails
    if (user) await User.deleteOne({ _id: user._id });
    next(err); // Pass the error to the error handler middleware
  }
};

//
export const verifyOTP = async (req, res, next) => {
  const { email, code } = req.body;
  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (!existingUser) throw createHttpError(404, "User not found");

    // Find the latest OTP for the user
    const otp = await OTP.findOne({ userId: existingUser._id }).sort({
      expiresAt: -1,
    });
    if (!otp || otp.expiresAt < Date.now())
      throw createHttpError(400, "OTP expired or invalid");

    // Validate OTP
    const isValid = await OTP.validateOTP(code);
    if (!isValid) throw createHttpError(400, "Invalid OTP");

    // Mark user as verified
    existingUser.isVerified = true;
    await existingUser.save();

    // Delete OTP document after successful verification
    await OTP.deleteOne({ _id: otp._id });

    res.status(200).json({ success: true, message: "Email verified" });
  } catch (error) {
    next(err);
  }
};

export const resendOTP = async (req, res, next) => {
  const { email } = req.body;
  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (!existingUser) throw createHttpError(404, "User not found");
    if (existingUser.isVerified)
      throw createHttpError(400, "User already verified");

    // Generate new OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    await OTP.create({ userId: existingUser._id, code: otpCode });

    await sendEmail({
      to: email,
      subject: "New OTP for FixItHub",
      html: `<p>Your new OTP is <strong>${otpCode}</strong>.</p>`,
    });

    res.status(200).json({ success: true, message: "Now OTP sent" });
  } catch (error) {
    next(err);
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
