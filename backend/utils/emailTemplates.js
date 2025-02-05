// utils/emailTemplates.js

/**
 * Generates the HTML for the verification email.
 * @param {string} otpCode - The OTP code to be included in the email.
 * @returns {string} - HTML string for the verification email.
 */
export const verificationEmailTemplate = (otpCode) => {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <title>🔧 Verify Your FixItHub Account</title>
      <style>
        body {
          font-family: 'Josefin Sans', Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f8fafc;
        }
        .container {
          max-width: 600px;
          margin: 2rem auto;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #6366f1 0%, #3b82f6 100%);
          padding: 2rem;
          text-align: center;
        }
        .logo {
          font-size: 2.5rem;
          color: white;
          font-weight: 700;
          margin: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        .content {
          padding: 2rem;
          color: #334155;
        }
        .otp-container {
          background: #f1f5f9;
          border-radius: 8px;
          padding: 1.5rem;
          margin: 2rem 0;
          text-align: center;
        }
        .otp {
          font-size: 2.5rem;
          letter-spacing: 0.5rem;
          color: #6366f1;
          font-weight: 700;
          margin: 1rem 0;
        }
        .emoji {
          font-size: 1.5rem;
          vertical-align: middle;
        }
        .footer {
          background: #f1f5f9;
          padding: 1.5rem;
          text-align: center;
          font-size: 0.875rem;
          color: #64748b;
        }
        .social {
          margin: 1rem 0;
          display: flex;
          gap: 1rem;
          width: full
          justify-content: evenly;
        }
        .note {
          color: #ef4444;
          background: #fee2e2;
          padding: 1rem;
          border-radius: 6px;
          margin: 1.5rem 0;
          font-size: 0.875rem;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="logo">
            <span class="emoji">🔧</span>FixItHub<span class="emoji">⚙️</span>
          </h1>
        </div>
        
        <div class="content">
          <p>👋 Hello FixItHubber!</p>
          
          <p>🚀 Welcome to the ultimate repair management platform! Let's get you verified:</p>
          
          <div class="otp-container">
            <p class="otp">${otpCode}</p>
            <p>⏳ Valid for 10 minutes</p>
          </div>

          <div class="note">
            🔒 Security Note: Never share this code with anyone. Our team will never ask for your OTP.
          </div>

          <p>🎉 Once verified, you'll get access to:</p>
          <ul>
            <li>📦 Manage repair orders</li>
            <li>🔔 Real-time status updates</li>
            <li>💬 Technician communication</li>
          </ul>
        </div>

        <div class="footer">
          <div class="social">
            <a href="https://github.com/AnasHany2193" style="color: #6366f1; text-decoration: none">🐦 GitHub</a>
            <a href="https://www.linkedin.com/in/anashany219/" style="color: #6366f1; text-decoration: none">💼 LinkedIn</a>
            <a href="https://www.facebook.com/anashany219/" style="color: #6366f1; text-decoration: none">📸 Facebook</a>
          </div>
          <p>© ${new Date().getFullYear()} FixItHub 🔧 | Building Better Repairs</p>
          <p>Need help? Reply to this email or contact support@fixithub.com</p>
        </div>
      </div>
    </body>
  </html>
  `;
};

/**
 * Generates the HTML for the resend OTP email.
 * @param {string} otpCode - The OTP code to be included in the email.
 * @returns {string} - HTML string for the resend OTP email.
 */
export const resendOtpEmailTemplate = (otpCode) => {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <title>New OTP for FixItHub</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          padding: 20px;
          border: 1px solid #dddddd;
        }
        .header {
          text-align: center;
          padding-bottom: 20px;
        }
        .separator {
          margin: 20px auto;
          width: 80%;
          border-top: 1px solid #cccccc;
          position: relative;
          text-align: center;
        }
        .separator span {
          background-color: #ffffff;
          padding: 0 10px;
          position: relative;
          top: -13px;
          font-size: 12px;
          color: #666666;
        }
        .content {
          font-size: 16px;
          line-height: 1.5;
          color: #333333;
        }
        .otp {
          font-size: 24px;
          font-weight: bold;
          color: #1a73e8;
        }
        .footer {
          font-size: 12px;
          text-align: center;
          color: #777777;
          margin-top: 30px;
          border-top: 1px solid #dddddd;
          padding-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>FixItHub</h2>
          <div class="separator">
          </div>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>We received a request to resend your OTP for verifying your FixItHub account. Please use the following OTP:</p>
          <p class="otp">${otpCode}</p>
          <p>If you did not request this, please ignore this email or contact our support team.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} FixItHub. All rights reserved.</p>
        </div>
      </div>
    </body>
  </html>
  `;
};

/**
 * Generates the HTML for the welcome email.
 * @param {string} userName - (Optional) The user's name to personalize the welcome message.
 * @returns {string} - HTML string for the welcome email.
 */
export const welcomeEmailTemplate = (userName = "User") => {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <title>🎉 Welcome to FixItHub, ${userName}!</title>
      <style>
        body {
          font-family: 'Josefin Sans', Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f8fafc;
        }
        .container {
          max-width: 600px;
          margin: 2rem auto;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #6366f1 0%, #3b82f6 100%);
          padding: 2rem;
          text-align: center;
        }
        .logo {
          font-size: 2.5rem;
          color: white;
          font-weight: 700;
          margin: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        .content {
          padding: 2rem;
          color: #334155;
          line-height: 1.6;
        }
        .cta-button {
          display: inline-block;
          background: #6366f1;
          color: white !important;
          padding: 12px 24px;
          border-radius: 8px;
          text-decoration: none;
          margin: 1.5rem 0;
          font-weight: 600;
        }
        .emoji {
          font-size: 1.5rem;
          vertical-align: middle;
        }
        .footer {
          background: #f1f5f9;
          padding: 1.5rem;
          text-align: center;
          font-size: 0.875rem;
          color: #64748b;
        }
        .social {
          margin: 1rem 0;
          display: flex;
          gap: 1rem;
          width: full
          justify-content: evenly;
        }
        .features {
          margin: 2rem 0;
          padding: 0;
          list-style: none;
        }
        .features li {
          margin: 1rem 0;
          padding-left: 2rem;
          position: relative;
        }
        .features li::before {
          content: '✓';
          color: #6366f1;
          position: absolute;
          left: 0;
          font-weight: bold;
        }
        .note {
          color: #ef4444;
          background: #fee2e2;
          padding: 1rem;
          border-radius: 6px;
          margin: 1.5rem 0;
          font-size: 0.875rem;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="logo">
            <span class="emoji">🔧</span>FixItHub<span class="emoji">⚙️</span>
          </h1>
        </div>
        
        <div class="content">
          <p>👋 Hey ${userName},</p>
          
          <p>🎉 Welcome to the FixItHub family! We're excited to have you on board. Your account is all set and ready to go!</p>
          
          <div style="text-align: center">
            <a href="#" class="cta-button">🚀 Start Your First Repair Request</a>
          </div>

          <p>Here's what you can do now:</p>
          <ul class="features">
            <li>📦 Create new repair requests in minutes</li>
            <li>🔔 Get real-time status updates</li>
            <li>💬 Chat directly with certified technicians</li>
            <li>📊 Track your repair history</li>
          </ul>

          <div class="note">
            🔒 Your security matters: We use bank-grade encryption to protect your data
          </div>

          <p>Need help getting started? Our <a href="#" style="color: #6366f1; text-decoration: none">📘 Knowledge Base</a> has everything you need!</p>
        </div>

        <div class="footer">
          <p>© ${new Date().getFullYear()} FixItHub 🔧 | Making Repairs Simple</p>
          <div class="social">
          Follow us: 
            <a href="https://github.com/AnasHany2193" style="color: #6366f1; text-decoration: none">🐦 GitHub</a>
            <a href="https://www.linkedin.com/in/anashany219/" style="color: #6366f1; text-decoration: none">💼 LinkedIn</a>
            <a href="https://www.facebook.com/anashany219/" style="color: #6366f1; text-decoration: none">📸 Facebook</a>
          </div>
          <p>Need help? Contact our friendly support team at <a href="mailto:support@fixithub.com" style="color: #6366f1; text-decoration: none">📩 support@fixithub.com</a></p>
        </div>
      </div>
    </body>
  </html>
  `;
};

/**
 * Generates the HTML for the password reset OTP email.
 * @param {string} otpCode - The OTP code for password reset.
 * @returns {string} - HTML string for the password reset OTP email.
 */
export const passwordResetOtpEmailTemplate = (otpCode) => {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <title>Password Reset OTP</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          padding: 20px;
          border: 1px solid #dddddd;
        }
        .header {
          text-align: center;
          padding-bottom: 20px;
        }
        .separator {
          margin: 20px auto;
          width: 80%;
          border-top: 1px solid #cccccc;
          position: relative;
          text-align: center;
        }
        .separator span {
          background-color: #ffffff;
          padding: 0 10px;
          position: relative;
          top: -13px;
          font-size: 12px;
          color: #666666;
        }
        .content {
          font-size: 16px;
          line-height: 1.5;
          color: #333333;
        }
        .otp {
          font-size: 24px;
          font-weight: bold;
          color: #1a73e8;
        }
        .footer {
          font-size: 12px;
          text-align: center;
          color: #777777;
          margin-top: 30px;
          border-top: 1px solid #dddddd;
          padding-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>FixItHub</h2>
          <div class="separator">
          </div>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>We received a request to reset your password. Please use the following One Time Password (OTP) to proceed with resetting your password:</p>
          <p class="otp">${otpCode}</p>
          <p>If you did not request a password reset, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} FixItHub. All rights reserved.</p>
        </div>
      </div>
    </body>
  </html>
  `;
};

/**
 * Generates the HTML for the password reset confirmation email.
 * @param {string} userName - (Optional) The user's name for a personalized greeting.
 * @returns {string} - HTML string for the password reset confirmation email.
 */
export const resetPasswordEmailTemplate = (userName = "User") => {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <title>Password Reset Successful</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          padding: 20px;
          border: 1px solid #dddddd;
        }
        .header {
          text-align: center;
          padding-bottom: 20px;
        }
        .separator {
          margin: 20px auto;
          width: 80%;
          border-top: 1px solid #cccccc;
          position: relative;
          text-align: center;
        }
        .separator span {
          background-color: #ffffff;
          padding: 0 10px;
          position: relative;
          top: -13px;
          font-size: 12px;
          color: #666666;
        }
        .content {
          font-size: 16px;
          line-height: 1.5;
          color: #333333;
        }
        .footer {
          font-size: 12px;
          text-align: center;
          color: #777777;
          margin-top: 30px;
          border-top: 1px solid #dddddd;
          padding-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>FixItHub</h2>
          <div class="separator">
          </div>
        </div>
        <div class="content">
          <p>Hello ${userName},</p>
          <p>Your password has been reset successfully.</p>
          <p>If you did not perform this action, please contact our support team immediately.</p>
          <p>Thank you for being a part of FixItHub.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} FixItHub. All rights reserved.</p>
        </div>
      </div>
    </body>
  </html>
  `;
};

/**
 * Generates the HTML for the worker approval email.
 * @param {string} userName - (Optional) The worker's name for a personalized greeting.
 * @returns {string} - HTML string for the worker approval email.
 */
export const workerApprovalEmailTemplate = (userName = "Worker") => {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <title>Worker Application Approved!</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          padding: 20px;
          border: 1px solid #dddddd;
        }
        .header {
          text-align: center;
          padding-bottom: 20px;
        }
        .separator {
          margin: 20px auto;
          width: 80%;
          border-top: 1px solid #cccccc;
          position: relative;
          text-align: center;
        }
        .separator span {
          background-color: #ffffff;
          padding: 0 10px;
          position: relative;
          top: -13px;
          font-size: 12px;
          color: #666666;
        }
        .content {
          font-size: 16px;
          line-height: 1.5;
          color: #333333;
        }
        .cta {
          display: block;
          width: 200px;
          margin: 30px auto;
          padding: 10px;
          text-align: center;
          background-color: #1a73e8;
          color: #ffffff;
          text-decoration: none;
          border-radius: 5px;
        }
        .footer {
          font-size: 12px;
          text-align: center;
          color: #777777;
          margin-top: 30px;
          border-top: 1px solid #dddddd;
          padding-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>FixItHub</h2>
          <div class="separator">
          </div>
        </div>
        <div class="content">
          <p>Hello ${userName},</p>
          <p>Congratulations! Your application to become a worker has been approved.</p>
          <p>You can now start offering repair services on FixItHub and help our community by providing your expertise.</p>
          <a href="https://fixithub.example.com/dashboard" class="cta">Go to Dashboard</a>
          <p>If you have any questions or need further assistance, feel free to contact our support team.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} FixItHub. All rights reserved.</p>
        </div>
      </div>
    </body>
  </html>
  `;
};
