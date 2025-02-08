import crypto from "crypto";
import jwt from "jsonwebtoken";
import createHttpError from "http-errors";

import cloudinary from "../config/cloudinary.js";

import OTP from "../models/OTP.js";
import User from "../models/User.js";
import {
  sendPasswordResetOtpEmail,
  sendResendOtpEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from "./../services/emailService.js";

//
export const register = async (req, res, next) => {
  const { username, email, password, role, skills, experience, documents } =
    req.body;
  let user;

  try {
    // Prevent direct admin registration
    if (role === "admin") throw createHttpError(403, "Nice try 😉");

    // Check if the user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }], // Check for email OR username
    });
    if (existingUser)
      throw createHttpError(409, "Email or username already registered");

    // Validate worker documents
    if (role === "worker") {
      if (!documents?.length) {
        throw createHttpError(400, "At least 1 document is required");
      }
    }

    // Create unverified user (worker status defaults to 'pending')
    user = await User.create({
      username,
      email,
      password,
      role,
      workerApplication:
        role === "worker"
          ? {
              skills: Array.isArray(skills)
                ? skills
                : skills?.split(",").map((s) => s.trim()),
              experience,
              documents, // Expects array of Cloudinary URLs from /api/v1/upload
              status: "pending",
            }
          : undefined,
    });

    // Generate OTP (example utility)
    const otpCode = crypto.randomInt(100000, 999999).toString(); // Secure 6-digit OTP

    // Save hashed OTP to DB
    await OTP.create({ userId: user._id, code: otpCode });
    console.log("register", otpCode);

    // Send verification email
    await sendVerificationEmail(email, otpCode);

    res.status(201).json({
      success: true,
      message: "Registration successful. Check email for OTP verification.",
    });
  } catch (err) {
    // Cleanup uploaded files on error
    if (user?.workerApplication?.documents) {
      await cloudinary.api.delete_resources(
        user.workerApplication.documents.map((doc) => doc.public_id)
      );
    }

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
    const isValid = await otp.validateOTP(code);
    if (!isValid) throw createHttpError(400, "Invalid OTP");

    // Mark user as verified
    existingUser.isVerified = true;
    await existingUser.save();

    // Delete OTP document after successful verification
    await OTP.deleteOne({ _id: otp._id });

    // Send a welcome email
    // Optionally, pass user's name if available (e.g., existingUser.username)
    await sendWelcomeEmail(email, existingUser.username);

    res.status(200).json({ success: true, message: "Email verified" });
  } catch (err) {
    next(err);
  }
};

//
export const resendOTP = async (req, res, next) => {
  const { email } = req.body;
  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (!existingUser) throw createHttpError(404, "User not found");
    if (existingUser.isVerified)
      throw createHttpError(400, "User already verified");

    // Generate new OTP
    const otpCode = crypto.randomInt(100000, 999999).toString(); // Secure 6-digit OTP

    await OTP.create({ userId: existingUser._id, code: otpCode });
    console.log("resendOTP", otpCode);

    // ReSend OTP verification email
    await sendResendOtpEmail(email, otpCode);

    res.status(200).json({ success: true, message: "New OTP sent" });
  } catch (err) {
    next(err);
  }
};

//
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    // Validate input
    if (!email || !password)
      throw createHttpError(400, "Email and password are required");

    // Find user and validate password
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.validatePassword(password)))
      throw createHttpError(401, "Invalid credentials");

    // Check if email is verified
    if (!user.isVerified) throw createHttpError(403, "Verify your email first");

    // Generate tokens
    const accessToken = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        tokenVersion: user.tokenVersion,
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { userId: user._id, tokenVersion: user.tokenVersion },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set refresh token in HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Generate a welcome message based on user role
    const welcomeMessage =
      user.role === "customer"
        ? "Welcome to FixItHub! Get ready to explore our amazing products and services."
        : user.role === "worker"
          ? "Welcome aboard, Worker! We're thrilled to have you join our dedicated team."
          : user.role === "admin"
            ? "Welcome Admin! You now have full access to our powerful control panel."
            : "WHO ARE YOU!! 😢";

    res.status(200).json({
      success: true,
      accessToken,
      user,
      message: welcomeMessage,
    });
  } catch (err) {
    next(err); // Pass the error to the error handler middleware
  }
};

//
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) throw createHttpError(401, "Unauthorized - No token");

    // Verify token and check token version
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user || !user.isVerified || decoded.tokenVersion !== user.tokenVersion)
      throw createHttpError(401, "Unauthorized");

    // Generate new access token
    const newAccessToken = jwt.sign(
      { userId: user._id, role: user.role, tokenVersion: user.tokenVersion },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );
    console.log("New Access Token Done!");
    res.status(200).json({ success: true, accessToken: newAccessToken });
  } catch (err) {
    // Handle specific JWT errors
    if (err.name === "TokenExpiredError")
      return next(
        createHttpError(401, "Session expired. Please log in again.")
      );

    if (err.name === "JsonWebTokenError")
      return next(createHttpError(401, "Invalid token."));

    next(err);
  }
};

//
export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) throw createHttpError(404, "User not found");
    if (!user.isVerified) throw createHttpError(403, "Verify your email first");

    // Generate OTP
    const otpCode = crypto.randomInt(100000, 999999).toString(); // Secure 6-digit OTP

    await OTP.create({
      userId: user._id,
      code: otpCode,
      type: "passwordReset",
    });
    console.log("forgotPassword", otpCode);

    // Send OTP via email
    await sendPasswordResetOtpEmail(email, otpCode);

    res.status(200).json({ success: true, message: "OTP sent to email" });
  } catch (err) {
    next(err);
  }
};

//
export const resetPassword = async (req, res, next) => {
  const { email, code, newPassword } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) throw createHttpError(404, "User not found");

    // Find the latest password reset OTP
    const otp = await OTP.findOne({
      userId: user._id,
      type: "passwordReset",
    }).sort({ expiresAt: -1 });
    if (!otp || otp.expiresAt < Date.now())
      throw createHttpError(400, "OTP expired or invalid");

    // Validate OTP
    const isValid = await otp.validateOTP(code);
    if (!isValid) throw createHttpError(400, "Invalid OTP");

    // Update password
    user.password = newPassword;
    await user.save();

    // Send the password reset confirmation email
    sendResetPasswordEmail(email, user.username);

    // Delete OTP after successful reset
    await OTP.deleteOne({ _id: otp._id });

    res
      .status(200)
      .json({ success: true, message: "Password reset successful" });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    // Atomic update to increment tokenVersion
    await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { tokenVersion: 1 } }, // Atomic increment
      { new: true }
    );

    // Clear refresh token cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res
      .status(200)
      .json({ success: true, message: "Logged out successfully ツ" });
  } catch (err) {
    next(err); // Pass the error to the centralized error handler
  }
};
