import dotenv from "dotenv";
import nodemailer from "nodemailer";
import {
  passwordResetOtpEmailTemplate,
  resendOtpEmailTemplate,
  verificationEmailTemplate,
  welcomeEmailTemplate,
} from "../utils/emailTemplates.js";

dotenv.config(); // Load environment variables

// Create a reusable transporter for FixItHub
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.FIXITHUB_GMAIL_USER,
    pass: process.env.FIXITHUB_GMAIL_PASSWORD,
  },
});

// Function to send emails
export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    await transporter.sendMail({
      from: `FixItHub <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });
    console.log(`📧 Email sent to ${to}`);
  } catch (error) {
    console.error("Email send error:", error.message);
    throw new Error("Failed to send email");
  }
};

// Example usage for sending verification email
export const sendVerificationEmail = async (email, otpCode) => {
  await sendEmail({
    to: email,
    subject: "Verify Your FixItHub Account",
    html: verificationEmailTemplate(otpCode),
  });
};

// Example usage for sending resend OTP email
export const sendResendOtpEmail = async (email, otpCode) => {
  await sendEmail({
    to: email,
    subject: "New OTP for FixItHub",
    html: resendOtpEmailTemplate(otpCode),
  });
};

/**
 * Sends a welcome email to the user after verification.
 * @param {string} email - The recipient's email address.
 * @param {string} userName - (Optional) The user's name.
 */
export const sendWelcomeEmail = async (email, userName) => {
  await sendEmail({
    to: email,
    subject: "Welcome to FixItHub!",
    html: welcomeEmailTemplate(userName),
  });
};

/**
 * Sends a password reset OTP email.
 * @param {string} email - The recipient's email address.
 * @param {string} otpCode - The OTP code for resetting the password.
 */
export const sendPasswordResetOtpEmail = async (email, otpCode) => {
  await sendEmail({
    to: email,
    subject: "Password Reset OTP",
    html: passwordResetOtpEmailTemplate(otpCode),
  });
};
