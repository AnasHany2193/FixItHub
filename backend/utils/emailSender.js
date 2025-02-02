import nodemailer from "nodemailer";
import dotenv from "dotenv";

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
export async function sendFixItHubEmail(to, subject, text, html) {
  try {
    const info = await transporter.sendMail({
      from: `"FixItHub Support" <${process.env.FIXITHUB_GMAIL_USER}>`,
      to: to,
      subject: subject,
      text: text,
      html: html,
    });
    console.log("Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

/**
 * Sends a welcome email to new users
 * @param {string} userEmail - User's email address
 * @param {string} userName - User's first name
 */
async function sendWelcomeEmail(userEmail, userName) {
  const emailContent = {
    from: "FixItHub <welcome@fixithub.com>",
    to: userEmail,
    subject: `Welcome to FixItHub, ${userName}!`,
    text: `Hi ${userName},\n\nWelcome to FixItHub! Start browsing repair services or create your first request.\n\nBest,\nThe FixItHub Team`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial;">
        <h1>Hi ${userName},</h1>
        <p>Welcome to FixItHub! 🛠️</p>
        <p>Get started:</p>
        <a href="https://fixithub.com/dashboard" 
           style="background: #0066ff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
          Go to Dashboard
        </a>
        <p>Need help? Reply to this email!</p>
      </div>
    `,
  };

  try {
    await sendFixItHubEmail(emailContent);
    console.log(`Welcome email sent to ${userEmail}`);
  } catch (error) {
    console.error(`Email failed for ${userEmail}:`, error.message);
    // Basic error logging
  }
}

// Trigger the email when a user signs up
// sendWelcomeEmail("anashany219@gmail.com", "Anas Hany");
