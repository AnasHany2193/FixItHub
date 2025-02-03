import dotenv from "dotenv";
import nodemailer from "nodemailer";

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
