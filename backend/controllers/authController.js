import crypto from "crypto";
import jwt from "jsonwebtoken";
import createHttpError from "http-errors";

import OTP from "../models/OTP.js";
import User from "../models/User.js";

import {
  sendPasswordResetOtpEmail,
  sendResendOtpEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from "../services/emailService.js";

// ===================================================
//                 AUTHENTICATION FLOW
// ===================================================

/**
 * @desc    Register new user (customer/worker)
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const register = async (req, res, next) => {
  const { username, email, password, role, skills, experience, documents } =
    req.body;
  let user;

  try {
    // Prevent direct admin registration
    if (role === "admin") throw createHttpError(403, "Nice try 😉");

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
              documents,
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
    // Rollback user creation if email fails
    if (user) await User.deleteOne({ _id: user._id });

    next(err); // Pass the error to the error handler middleware
  }
};

/**
 * @desc    Verify user email with OTP
 * @route   POST /api/v1/auth/verify-otp
 * @access  Public
 */
export const verifyOTP = async (req, res, next) => {
  const { email, code } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser) throw createHttpError(404, "User not found");

    // Find valid OTP using atomic operation
    const otp = await OTP.findOneAndUpdate(
      {
        userId: existingUser._id,
        expiresAt: { $gt: Date.now() },
        attempts: { $lt: 3 },
      },
      { $inc: { attempts: 1 } },
      { new: true, sort: { expiresAt: -1 } }
    );

    if (!otp)
      throw createHttpError(400, "OTP expired/invalid or max attempts reached");

    // Validate using schema method
    const isValid = await otp.validateOTP(code);
    if (!isValid) throw createHttpError(400, "Invalid OTP");

    // Cleanup operations
    await Promise.all([
      OTP.deleteOne({ _id: otp._id }),
      User.findByIdAndUpdate(existingUser._id, { isVerified: true }),
    ]);

    // Send a welcome email
    // Optionally, pass user's name if available (e.g., existingUser.username)
    await sendWelcomeEmail(email, existingUser.username);

    res.status(200).json({ success: true, message: "Email verified" });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Resend OTP to unverified users
 * @route   POST /api/v1/auth/resend-otp
 * @access  Public
 */
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

/**
 * @desc    Authenticate user and issue tokens
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
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

    user.tokenVersion += 1;
    await user.save();

    // Generate token
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        tokenVersion: user.tokenVersion,
      },
      process.env.JWT_REFRESH_SECRET, // Use refresh secret
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN } // 7 days
    );

    // Generate a welcome message based on user role
    const welcomeMessage =
      user.role === "customer"
        ? "Welcome to FixItHub! Get ready to explore our amazing products and services."
        : user.role === "worker"
          ? "Welcome aboard, Worker! We're thrilled to have you join our dedicated team."
          : user.role === "admin"
            ? "Welcome Admin! You now have full access to our powerful control panel."
            : "WHO ARE YOU!! 😢";

    // Set refresh access token in HTTP-only cookie
    res
      .status(200)
      .cookie("refreshToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .json({
        success: true,
        user,
        message: welcomeMessage,
      });
  } catch (err) {
    next(err); // Pass the error to the error handler middleware
  }
};

/**
 * @desc    Terminate user session
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
export const logout = async (req, res, next) => {
  try {
    // Atomic update to increment tokenVersion
    await User.findByIdAndUpdate(req.user._id, { $inc: { tokenVersion: 1 } });

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

// ===================================================
//                  PASSWORD RECOVERY
// ===================================================

/**
 * @desc    Initiate password reset flow
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(200).json({
        success: true,
        message: "If the email exists, OTP will be sent",
      });

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

/**
 * @desc    Complete password reset with OTP
 * @route   POST /api/v1/auth/reset-password
 * @access  Public
 */
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
