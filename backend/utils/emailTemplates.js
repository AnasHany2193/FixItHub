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
      <title>Verify Your FixItHub Account</title>
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
            <span>123-465</span>
          </div>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>Thank you for registering with FixItHub. Please use the following One Time Password (OTP) to verify your account. This OTP is valid for <strong>10 minutes</strong>.</p>
          <p>Your OTP is:</p>
          <p class="otp">${otpCode}</p>
          <p>If you did not initiate this request, please ignore this email.</p>
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
            <span>123-465</span>
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

// utils/emailTemplates.js

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
      <title>Welcome to FixItHub!</title>
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
          <h2>Welcome to FixItHub, ${userName}!</h2>
          <div class="separator">
            <span>123-465</span>
          </div>
        </div>
        <div class="content">
          <p>Dear ${userName},</p>
          <p>We're thrilled to have you join the FixItHub community. Your email has been successfully verified, and you can now take full advantage of our services.</p>
          <p>Feel free to explore our platform, post repair requests, bid on projects, and connect with our expert team. We are here to make your experience seamless and enjoyable.</p>
          <p>Welcome aboard!</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} FixItHub. All rights reserved.</p>
        </div>
      </div>
    </body>
  </html>
  `;
};

// utils/emailTemplates.js

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
            <span>123-465</span>
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

// utils/emailTemplates.js

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
            <span>123-465</span>
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
