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
  try {
    const { role, skills, email, password, username, experience, documents } =
      req.body;
    if (role === "admin") throw createHttpError(403, "Nice try 😉");

    const user = await User.create({
      username,
      email,
      password,
      role,
      workerApplication: role === "worker" && {
        skills: Array.isArray(skills)
          ? skills
          : skills?.split(",").map((s) => s.trim()),
        experience,
        documents,
        status: "pending",
      },
    });

    // Generate OTP (example utility)
    const otpCode = crypto.randomInt(100000, 999999).toString(); // Secure 6-digit OTP
    await OTP.create({ userId: user._id, code: otpCode });
    console.log(">|< register --> ", otpCode);

    // Send verification email
    await sendVerificationEmail(email, otpCode);

    res.status(201).json({
      success: true,
      message: "Registration successful. Check email for OTP verification.",
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Verify user email with OTP
 * @route   POST /api/v1/auth/verify-otp
 * @access  Public
 */
export const verifyOTP = async (req, res, next) => {
  try {
    const { email, code } = req.body;
    const user =
      (await User.findOne({ email })) || createHttpError(404, "User not found");

    const otp =
      (await OTP.findOneAndUpdate(
        {
          userId: user._id,
          expiresAt: { $gt: Date.now() },
          attempts: { $lt: 3 },
        },
        { $inc: { attempts: 1 } },
        { new: true, sort: { expiresAt: -1 } }
      )) || createHttpError(400, "OTP expired/invalid or max attempts reached");

    // Validate using schema method
    if (!(await otp.validateOTP(code)))
      throw createHttpError(400, "Invalid OTP");

    await Promise.all([
      OTP.deleteOne({ _id: otp._id }),
      User.findByIdAndUpdate(user._id, { isVerified: true }),
      sendWelcomeEmail(email, user.username),
    ]);

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
  try {
    const { email } = req.body;
    const user =
      (await User.findOne({ email })) || createHttpError(404, "User not found");
    if (user.isVerified) throw createHttpError(400, "User already verified");

    // Generate new OTP
    const otpCode = crypto.randomInt(100000, 999999).toString(); // Secure 6-digit OTP
    await OTP.create({ userId: user._id, code: otpCode });
    console.log(">|< resendOTP --> ", otpCode);

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
    if (!email || !password)
      throw createHttpError(400, "Email and password required");

    const user =
      (await User.findOne({ email }).select("+password")) ||
      createHttpError(401, "Invalid credentials");
    if (!(await user.validatePassword(password)))
      throw createHttpError(401, "Invalid credentials");
    if (!user.isVerified) throw createHttpError(403, "Verify your email first");

    user.tokenVersion += 1;
    await user.save();

    const welcomeMessages = {
      customer: "Welcome to FixItHub! Explore our products and services.",
      worker: "Welcome aboard! Join our dedicated team.",
      admin: "Admin access granted to control panel.",
    };

    res
      .cookie(
        "refreshToken",
        jwt.sign(
          {
            userId: user._id,
            role: user.role,
            tokenVersion: user.tokenVersion,
          },
          process.env.JWT_REFRESH_SECRET,
          { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
        ),
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
          maxAge: 604800000, // 7 days
        }
      )
      .json({
        success: true,
        user,
        message: welcomeMessages[user.role] || "WHO ARE YOU!! 😢",
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
    await User.findByIdAndUpdate(req.user._id, { $inc: { tokenVersion: 1 } });

    res
      .clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      })
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
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (user?.isVerified) {
      const otpCode = crypto.randomInt(100000, 999999).toString();
      await OTP.create({
        userId: user._id,
        code: otpCode,
        type: "passwordReset",
      });
      console.log(">|< forgotPassword --> ", otpCode);
      await sendPasswordResetOtpEmail(email, otpCode);
    }

    res.json({
      success: true,
      message: "If the email exists, OTP will be sent",
    });
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
  try {
    const { email, code, newPassword } = req.body;
    const user =
      (await User.findOne({ email })) || createHttpError(404, "User not found");

    const otp =
      (await OTP.findOne({
        userId: user._id,
        type: "passwordReset",
        expiresAt: { $gt: Date.now() },
      }).sort({ expiresAt: -1 })) ||
      createHttpError(400, "OTP expired or invalid");

    if (!(await otp.validateOTP(code)))
      throw createHttpError(400, "Invalid OTP");

    user.password = newPassword;
    await Promise.all([
      user.save(),
      OTP.deleteOne({ _id: otp._id }),
      sendResetPasswordEmail(email, user.username),
    ]);

    res
      .status(200)
      .json({ success: true, message: "Password reset successful" });
  } catch (err) {
    next(err);
  }
};
