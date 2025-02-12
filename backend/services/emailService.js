import dotenv from "dotenv";
import nodemailer from "nodemailer";
import createHttpError from "http-errors";
import {
  passwordResetOtpEmailTemplate,
  resendOtpEmailTemplate,
  resetPasswordEmailTemplate,
  verificationEmailTemplate,
  welcomeEmailTemplate,
  workerApprovalEmailTemplate,
} from "../utils/emailTemplates.js";

dotenv.config(); // Load environment variables

// Configure reusable transporter with connection pool
const transporter = nodemailer.createTransport({
  service: "gmail",
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  auth: {
    user: process.env.FIXITHUB_GMAIL_USER,
    pass: process.env.FIXITHUB_GMAIL_PASSWORD,
  },
  logger: true,
  debug: process.env.NODE_ENV === "development",
});

/**
 * @desc    Core email sending function with retry logic
 * @param   {Object} options - Email parameters
 * @param   {number} [retries=3] - Retry attempts
 * @returns {Promise<Object>} Nodemailer result
 * @throws  {BadGateway} If email service unavailable
 */
export const sendEmail = async ({ to, subject, text, html }, retries = 3) => {
  try {
    const info = await transporter.sendMail({
      from: `FixItHub <${process.env.FIXITHUB_GMAIL_USER}>`,
      to,
      subject,
      text,
      html,
      priority: "high",
      headers: {
        "X-Entity-Ref": "FixItHub-Notification",
      },
    });

    console.log(`📧 Email sent to ${to} [MessageID: ${info.messageId}]`);
    return info;
  } catch (error) {
    if (retries > 0) {
      console.warn(`Retrying email to ${to} (${retries} attempts left)`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return sendEmail({ to, subject, text, html }, retries - 1);
    }
    throw createHttpError.BadGateway(
      "Email service temporarily unavailable. Please try again later.",
      {
        details: error.response,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      }
    );
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

/**
 * Sends a password reset confirmation email.
 * @param {string} email - The recipient's email address.
 * @param {string} userName - (Optional) The user's name.
 */
export const sendResetPasswordEmail = async (email, userName) => {
  await sendEmail({
    to: email,
    subject: "Password Reset Successful",
    html: resetPasswordEmailTemplate(userName),
  });
};

/**
 * @desc    Sends worker application status update
 * @param   {string} email - Recipient email
 * @param   {string} userName - Worker's name
 * @param   {'approved'|'rejected'} status - Application status
 * @param   {string} [reason] - Rejection reason
 * @returns {Promise<void>}
 */
export const sendApprovalEmail = async (email, userName, status, reason) => {
  try {
    await sendEmail({
      to: email,
      subject:
        status === "approved"
          ? "🎉 Worker Application Approved!"
          : "⚠️ Application Update",
      html: workerApprovalEmailTemplate(userName, status, reason),
    });
  } catch (error) {
    console.error("Failed to send approval email:", error);
    throw createHttpError.BadGateway("Could not send application update");
  }
};
