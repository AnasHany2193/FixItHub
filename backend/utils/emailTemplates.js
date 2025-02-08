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
          margin: 0;
          padding: 0;
          background: #f0f9ff;
          font-family: 'Josefin Sans', Arial, sans-serif;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background: linear-gradient(145deg, #ffffff 0%, #f8faff 100%);
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(79, 70, 229, 0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          padding: 40px 30px;
          text-align: center;
        }
        .logo {
          font-size: 32px;
          color: white;
          font-weight: 700;
          margin: 0;
          letter-spacing: -1px;
        }
        .emoji {
          font-size: 48px;
          margin-bottom: 15px;
        }
        .content {
          padding: 40px 30px;
          color: #1e293b;
        }
        .otp-box {
          background: #e0e7ff;
          border-radius: 12px;
          padding: 20px;
          margin: 30px 0;
          text-align: center;
        }
        .otp {
          font-size: 42px;
          font-weight: 700;
          color: #4f46e5;
          letter-spacing: 4px;
          margin: 15px 0;
        }
        .social-links {
          text-align: center;
          margin: 40px 0;
        }
        .social-link {
          display: inline-block;
          margin: 0 12px;
          padding: 10px 20px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          transition: transform 0.2s ease;
        }
        .footer {
          background: #f1f5f9;
          padding: 25px;
          text-align: center;
          color: #64748b;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="emoji">🔧✨</div>
          <h1 class="logo">FixItHub</h1>
        </div>
        
        <div class="content">
          <p>Hey there! 👋</p>
          <p>Welcome to the FixItHub community! 🎉 Let's get your account verified:</p>
          
          <div class="otp-box">
            <p>Your magic code: 🔑</p>
            <div class="otp">${otpCode}</div>
            <p>⏳ Valid for 10 minutes</p>
          </div>

          <p>Need help? 🆘 Just reply to this email - we're here 24/7! 💬</p>
          
          <div class="social-links">
            <p>Let's connect! 🌐</p>
            <a href="https://github.com/AnasHany2193" class="social-link" style="background: #4f46e5; color: white;">
              GitHub 🐙
            </a>
            <a href="https://www.linkedin.com/in/anashany219/" class="social-link" style="background: #0A66C2; color: white;">
              LinkedIn 💼
            </a>
            <a href="https://www.facebook.com/anashany219/" class="social-link" style="background: #1877F2; color: white;">
              Facebook 👍
            </a>
          </div>
        </div>

        <div class="footer">
          <p>🔒 Your security is our priority</p>
          <p>© ${new Date().getFullYear()} FixItHub | Built with ❤️ and ☕</p>
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
      <title>🔑 New OTP for FixItHub</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          background: #f0f9ff;
          font-family: 'Josefin Sans', Arial, sans-serif;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background: linear-gradient(145deg, #ffffff 0%, #f8faff 100%);
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(79, 70, 229, 0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          padding: 40px 30px;
          text-align: center;
        }
        .logo {
          font-size: 32px;
          color: white;
          font-weight: 700;
          margin: 0;
          letter-spacing: -1px;
        }
        .emoji {
          font-size: 48px;
          margin-bottom: 15px;
        }
        .content {
          padding: 40px 30px;
          color: #1e293b;
        }
        .otp-box {
          background: #e0e7ff;
          border-radius: 12px;
          padding: 20px;
          margin: 30px 0;
          text-align: center;
        }
        .otp {
          font-size: 42px;
          font-weight: 700;
          color: #4f46e5;
          letter-spacing: 4px;
          margin: 15px 0;
        }
        .warning {
          background: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 15px;
          border-radius: 8px;
          margin: 30px 0;
          color: #856404;
        }
        .social-links {
          text-align: center;
          margin: 40px 0;
        }
        .social-link {
          display: inline-block;
          margin: 0 12px;
          padding: 10px 20px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          transition: transform 0.2s ease;
        }
        .footer {
          background: #f1f5f9;
          padding: 25px;
          text-align: center;
          color: #64748b;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="emoji">🔑🔄</div>
          <h1 class="logo">FixItHub</h1>
        </div>
        
        <div class="content">
          <p>Hey there! 👋</p>
          <p>We've got your request for a new OTP! Here's your fresh verification code: 🔄</p>
          
          <div class="otp-box">
            <p>Your new magic code: ✨</p>
            <div class="otp">${otpCode}</div>
            <p>⏳ Valid for 10 minutes</p>
          </div>

          <div class="warning">
            <p>⚠️ Important: If you didn't request this, please:</p>
            <ol>
              <li>Ignore this email</li>
              <li>Change your password immediately</li>
              <li>Contact our support team</li>
            </ol>
          </div>

          <div class="social-links">
            <p>Need help? Reach out! 🤝</p>
            <a href="https://github.com/AnasHany2193" class="social-link" style="background: #4f46e5; color: white;">
              GitHub 🐙
            </a>
            <a href="https://www.linkedin.com/in/anashany219/" class="social-link" style="background: #0A66C2; color: white;">
              LinkedIn 💼
            </a>
            <a href="https://www.facebook.com/anashany219/" class="social-link" style="background: #1877F2; color: white;">
              Facebook 👍
            </a>
          </div>
        </div>

        <div class="footer">
          <p>🔒 Your security is our top priority</p>
          <p>© ${new Date().getFullYear()} FixItHub | Built with ❤️ and ☕</p>
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
          background: linear-gradient(145deg, #f0f9ff 0%, #e0f2fe 100%);
        }
        .container {
          max-width: 600px;
          margin: 2rem auto;
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(79, 70, 229, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          padding: 3rem 2rem;
          text-align: center;
          position: relative;
        }
        .header::before {
          content: '';
          position: absolute;
          top: -50px;
          left: -50px;
          width: 150px;
          height: 150px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
        }
        .header::after {
          content: '';
          position: absolute;
          bottom: -30px;
          right: -30px;
          width: 100px;
          height: 100px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
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
          position: relative;
          z-index: 2;
        }
        .content {
          padding: 2.5rem;
          color: #1e293b;
          line-height: 1.6;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          color: white !important;
          padding: 14px 32px;
          border-radius: 12px;
          text-decoration: none;
          margin: 2rem 0;
          font-weight: 600;
          box-shadow: 0 4px 6px rgba(79, 70, 229, 0.2);
          transition: transform 0.2s ease;
        }
        .cta-button:hover {
          transform: translateY(-2px);
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
          margin: 1.5rem 0;
          display: flex;
          gap: 1.5rem;
          justify-content: center;
        }
        .social a {
          color: #4f46e5;
          text-decoration: none;
          font-weight: 600;
          padding: 8px 16px;
          border-radius: 8px;
          transition: all 0.2s ease;
        }
        .social a:hover {
          background: rgba(79, 70, 229, 0.1);
        }
        .features {
          margin: 2rem 0;
          padding: 0;
          list-style: none;
        }
        .features li {
          margin: 1.25rem 0;
          padding-left: 2rem;
          position: relative;
        }
        .features li::before {
          content: '✓';
          color: #6366f1;
          position: absolute;
          left: 0;
          font-weight: bold;
          font-size: 1.2rem;
        }
        .note {
          color: #dc2626;
          background: #fee2e2;
          padding: 1.25rem;
          border-radius: 12px;
          margin: 2rem 0;
          font-size: 0.875rem;
          border-left: 4px solid #dc2626;
        }
        .confetti {
          position: absolute;
          width: 10px;
          height: 10px;
          background: #fff;
          border-radius: 50%;
          opacity: 0;
          z-index: 1;
          animation: confetti 2s ease-out infinite;
        }
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0); opacity: 1; }
          100% { transform: translateY(200px) rotate(360deg); opacity: 0; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          ${Array.from({ length: 20 })
            .map(
              (_, i) => `
            <div class="confetti" style="
              left: ${Math.random() * 100}%;
              animation-delay: ${Math.random()}s;
              background: hsl(${Math.random() * 360}, 100%, 75%);
            "></div>
          `
            )
            .join("")}
          <h1 class="logo">
            <span class="emoji">🔧</span>FixItHub<span class="emoji">⚙️</span>
          </h1>
          <p style="color: rgba(255,255,255,0.8); margin-top: 1rem; font-size: 1.1rem;">
            Your repair journey starts here!
          </p>
        </div>
        
        <div class="content">
          <p>👋 Hey ${userName},</p>
          
          <p>🎉 Welcome to the FixItHub family! We're thrilled to have you on board. Your account is all set and ready to go!</p>
          
          <div style="text-align: center">
            <a href="#" class="cta-button">🚀 Start Your First Repair Request</a>
          </div>

          <p>Here's what you can do now:</p>
          <ul class="features">
            <li>📦 Create new repair requests in minutes</li>
            <li>🔔 Get real-time status updates</li>
            <li>💬 Chat directly with certified technicians</li>
            <li>📊 Track your repair history</li>
            <li>⭐ Rate and review your experiences</li>
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
            <a href="https://github.com/AnasHany2193">🐙 GitHub</a>
            <a href="https://www.linkedin.com/in/anashany219/">💼 LinkedIn</a>
            <a href="https://www.facebook.com/anashany219/">👍 Facebook</a>
          </div>
          <p style="margin-top: 1rem;">Need help? Contact our friendly support team at <a href="mailto:support@fixithub.com" style="color: #6366f1; text-decoration: none">📩 support@fixithub.com</a></p>
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
      <title>🔐 Password Reset Request - FixItHub</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          background: #f0f9ff;
          font-family: 'Josefin Sans', Arial, sans-serif;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background: linear-gradient(145deg, #ffffff 0%, #f8faff 100%);
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(79, 70, 229, 0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          padding: 40px 30px;
          text-align: center;
          position: relative;
        }
        .logo {
          font-size: 32px;
          color: white;
          font-weight: 700;
          margin: 0;
          letter-spacing: -1px;
        }
        .emoji {
          font-size: 48px;
          margin-bottom: 15px;
        }
        .content {
          padding: 40px 30px;
          color: #1e293b;
        }
        .otp-box {
          background: #e0e7ff;
          border-radius: 12px;
          padding: 20px;
          margin: 30px 0;
          text-align: center;
        }
        .otp {
          font-size: 42px;
          font-weight: 700;
          color: #4f46e5;
          letter-spacing: 4px;
          margin: 15px 0;
        }
        .warning {
          background: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 15px;
          border-radius: 8px;
          margin: 30px 0;
          color: #856404;
        }
        .footer {
          background: #f1f5f9;
          padding: 25px;
          text-align: center;
          color: #64748b;
          font-size: 14px;
        }
        .security-tips {
          margin: 2rem 0;
          padding: 0;
          list-style: none;
        }
        .security-tips li {
          margin: 1rem 0;
          padding-left: 2rem;
          position: relative;
        }
        .security-tips li::before {
          content: '🔒';
          position: absolute;
          left: 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="emoji">🔐</div>
          <h1 class="logo">FixItHub</h1>
          <p style="color: rgba(255,255,255,0.8); margin-top: 1rem; font-size: 1.1rem;">
            Securing Your Account
          </p>
        </div>
        
        <div class="content">
          <p>👋 Hello there,</p>
          
          <p>We received a request to reset your FixItHub account password. Here's your One-Time Password (OTP):</p>
          
          <div class="otp-box">
            <p>Your security code: 🔑</p>
            <div class="otp">${otpCode}</div>
            <p>⏳ Valid for 10 minutes</p>
          </div>

          <div class="warning">
            <p>⚠️ If you didn't request this password reset:</p>
            <ol>
              <li>Ignore this email</li>
              <li>Change your password immediately</li>
              <li>Contact our support team</li>
            </ol>
          </div>

          <p>Here are some security tips to keep your account safe:</p>
          <ul class="security-tips">
            <li>Never share your OTP with anyone</li>
            <li>Use a strong, unique password</li>
            <li>Enable two-factor authentication</li>
            <li>Regularly update your password</li>
          </ul>

          <p>Need help? Contact our support team at <a href="mailto:support@fixithub.com" style="color: #6366f1; text-decoration: none">📩 support@fixithub.com</a></p>
        </div>

        <div class="footer">
          <p>🔒 Your security is our top priority</p>
          <p>© ${new Date().getFullYear()} FixItHub | Built with ❤️ and ☕</p>
          <div style="margin-top: 1rem;">
            Follow us: 
            <a href="https://github.com/AnasHany2193" style="color: #6366f1; text-decoration: none">🐙 GitHub</a> | 
            <a href="https://www.linkedin.com/in/anashany219/" style="color: #6366f1; text-decoration: none">💼 LinkedIn</a> | 
            <a href="https://www.facebook.com/anashany219/" style="color: #6366f1; text-decoration: none">👍 Facebook</a>
          </div>
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
      <title>🎉 Password Reset Successful - FixItHub</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          background: #f0f9ff;
          font-family: 'Josefin Sans', Arial, sans-serif;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background: linear-gradient(145deg, #ffffff 0%, #f8faff 100%);
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(79, 70, 229, 0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          padding: 40px 30px;
          text-align: center;
          position: relative;
        }
        .logo {
          font-size: 32px;
          color: white;
          font-weight: 700;
          margin: 0;
          letter-spacing: -1px;
        }
        .emoji {
          font-size: 48px;
          margin-bottom: 15px;
        }
        .content {
          padding: 40px 30px;
          color: #1e293b;
        }
        .success-box {
          background: #dcfce7;
          border-left: 4px solid #22c55e;
          padding: 20px;
          border-radius: 12px;
          margin: 30px 0;
          color: #166534;
        }
        .warning {
          background: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 15px;
          border-radius: 8px;
          margin: 30px 0;
          color: #856404;
        }
        .footer {
          background: #f1f5f9;
          padding: 25px;
          text-align: center;
          color: #64748b;
          font-size: 14px;
        }
        .security-tips {
          margin: 2rem 0;
          padding: 0;
          list-style: none;
        }
        .security-tips li {
          margin: 1rem 0;
          padding-left: 2rem;
          position: relative;
        }
        .security-tips li::before {
          content: '🔒';
          position: absolute;
          left: 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="emoji">🔐✅</div>
          <h1 class="logo">FixItHub</h1>
          <p style="color: rgba(255,255,255,0.8); margin-top: 1rem; font-size: 1.1rem;">
            Account Security Update
          </p>
        </div>
        
        <div class="content">
          <p>👋 Hello ${userName},</p>
          
          <div class="success-box">
            <p>🎉 Your password has been successfully reset!</p>
          </div>

          <div class="warning">
            <p>⚠️ If you didn't perform this password reset:</p>
            <ol>
              <li>Contact our support team immediately</li>
              <li>Change your password again</li>
              <li>Enable two-factor authentication</li>
            </ol>
          </div>

          <p>Here are some tips to keep your account secure:</p>
          <ul class="security-tips">
            <li>Use a strong, unique password</li>
            <li>Enable two-factor authentication</li>
            <li>Regularly update your password</li>
            <li>Never share your credentials</li>
          </ul>

          <p>Need help? Contact our support team at <a href="mailto:support@fixithub.com" style="color: #6366f1; text-decoration: none">📩 support@fixithub.com</a></p>
        </div>

        <div class="footer">
          <p>🔒 Your security is our top priority</p>
          <p>© ${new Date().getFullYear()} FixItHub | Built with ❤️ and ☕</p>
          <div style="margin-top: 1rem;">
            Follow us: 
            <a href="https://github.com/AnasHany2193" style="color: #6366f1; text-decoration: none">🐙 GitHub</a> | 
            <a href="https://www.linkedin.com/in/anashany219/" style="color: #6366f1; text-decoration: none">💼 LinkedIn</a> | 
            <a href="https://www.facebook.com/anashany219/" style="color: #6366f1; text-decoration: none">👍 Facebook</a>
          </div>
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
      <title>🎉🔧 Worker Application Approved! - FixItHub</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          background: #f0f9ff;
          font-family: 'Josefin Sans', Arial, sans-serif;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background: linear-gradient(145deg, #ffffff 0%, #f8faff 100%);
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(79, 70, 229, 0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          padding: 40px 30px;
          text-align: center;
          position: relative;
        }
        .logo {
          font-size: 32px;
          color: white;
          font-weight: 700;
          margin: 0;
          letter-spacing: -1px;
        }
        .emoji {
          font-size: 48px;
          margin-bottom: 15px;
        }
        .content {
          padding: 40px 30px;
          color: #1e293b;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          color: white !important;
          padding: 14px 32px;
          border-radius: 12px;
          text-decoration: none;
          margin: 2rem 0;
          font-weight: 600;
          box-shadow: 0 4px 6px rgba(79, 70, 229, 0.2);
          transition: transform 0.2s ease;
        }
        .cta-button:hover {
          transform: translateY(-2px);
        }
        .success-box {
          background: #dcfce7;
          border-left: 4px solid #22c55e;
          padding: 20px;
          border-radius: 12px;
          margin: 30px 0;
          color: #166534;
        }
        .footer {
          background: #f1f5f9;
          padding: 25px;
          text-align: center;
          color: #64748b;
          font-size: 14px;
        }
        .steps {
          margin: 2rem 0;
          padding: 0;
          list-style: none;
        }
        .steps li {
          margin: 1.5rem 0;
          padding-left: 2rem;
          position: relative;
        }
        .steps li::before {
          content: '👉';
          position: absolute;
          left: 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="emoji">🛠️🎉</div>
          <h1 class="logo">FixItHub Pro</h1>
          <p style="color: rgba(255,255,255,0.8); margin-top: 1rem; font-size: 1.1rem;">
            Welcome to Our Expert Community!
          </p>
        </div>
        
        <div class="content">
          <div class="success-box">
            <p>🌟 Congratulations ${userName}! Your application has been approved!</p>
          </div>

          <p>🚀 You're now officially part of the FixItHub repair experts community. Get ready to:</p>
          
          <ul class="steps">
            <li>Connect with customers needing your skills</li>
            <li>Build your professional reputation</li>
            <li>Grow your repair business</li>
            <li>Earn competitive rates</li>
          </ul>

          <div style="text-align: center">
            <a href="https://fixithub.example.com/dashboard" class="cta-button">
              🚀 Launch Your Dashboard
            </a>
          </div>

          <p>💡 Pro Tips for Success:</p>
          <ul class="steps">
            <li>Complete your profile with portfolio photos</li>
            <li>Set your availability calendar</li>
            <li>Read our service quality guidelines</li>
          </ul>
        </div>

        <div class="footer">
          <p>🔧 Need help? Contact our support team at 
            <a href="mailto:support@fixithub.com" style="color: #6366f1; text-decoration: none">
              📩 support@fixithub.com
            </a>
          </p>
          <p>© ${new Date().getFullYear()} FixItHub | Building Trust in Repairs</p>
          <div style="margin-top: 1rem;">
            Follow us: 
            <a href="https://github.com/AnasHany2193" style="color: #6366f1; text-decoration: none">🐙 GitHub</a> | 
            <a href="https://www.linkedin.com/in/anashany219/" style="color: #6366f1; text-decoration: none">💼 LinkedIn</a> | 
            <a href="https://www.facebook.com/anashany219/" style="color: #6366f1; text-decoration: none">👍 Facebook</a>
          </div>
        </div>
      </div>
    </body>
  </html>
  `;
};

export const auctionExpiredEmailTemplate = (
  itemType,
  auctionId,
  userName = "Dear"
) => {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <title>⏰ Auction Expired - FixItHub</title>
      <style>
        /* Keep existing styles from verification template */
        .status-box {
          background: #e0f2fe;
          border-radius: 12px;
          padding: 25px;
          margin: 30px 0;
          text-align: center;
        }
        .highlight {
          color: #4f46e5;
          font-weight: 700;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="emoji">⏰🔧</div>
          <h1 class="logo">FixItHub</h1>
        </div>
        
        <div class="content">
           <p>🌟 Congratulations ${userName}! 👋!</p>
          <p>Your auction for <span class="highlight">${itemType}</span> has officially ended.</p>
          
          <div class="status-box">
            <p style="font-size: 24px;">🛑 Auction ID: ${auctionId}</p>
            <p>🔍 Check your dashboard to review bids and select a repair provider!</p>
          </div>

          <p>Next steps:</p>
          <ol>
            <li>Review worker bids & ratings ⭐</li>
            <li>Select your preferred provider ✅</li>
            <li>Track repair progress in real-time 🚚</li>
          </ol>

          <div class="social-links">
            <a href="https://fixithub.com/dashboard" class="social-link" 
               style="background: #4f46e5; color: white;">
              Go to Dashboard 📊
            </a>
          </div>
        </div>

        <div class="footer">
          <p>Need help choosing? Reply to this email! 📩</p>
          <p>© ${new Date().getFullYear()} FixItHub | Repair with confidence</p>
        </div>
      </div>
    </body>
  </html>
  `;
};

// Bid Accepted Notification (Worker)
export const bidAcceptedEmailTemplate = (itemType, price, customerName) => {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <title>🎉 Bid Accepted! - FixItHub</title>
      <style>
        /* Existing styles */
        .celebrate { font-size: 48px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="emoji">🔧💰</div>
          <h1 class="logo">FixItHub</h1>
        </div>
        
        <div class="content">
          <div class="celebrate">🎉 Congratulations!</div>
          <p>Your bid for <span class="highlight">${itemType}</span> has been accepted by <strong>${customerName}</strong>!</p>
          
          <div class="status-box">
            <p>💵 Accepted Price: $${price}</p>
            <p>⏱️ Start repair within 24 hours</p>
          </div>

          <p>Next steps:</p>
          <ol>
            <li>Contact customer via repair chat 💬</li>
            <li>Confirm repair details 📝</li>
            <li>Update repair progress regularly 📈</li>
          </ol>

          <div class="social-links">
            <a href="${process.env.CLIENT_URL}/dashboard/repairs" 
               class="social-link" 
               style="background: #4f46e5; color: white;">
              Go to Repair Dashboard 🛠️
            </a>
          </div>
        </div>

        <div class="footer">
          <p>Questions? Reply to this email! 📩</p>
          <p>© ${new Date().getFullYear()} FixItHub | Your repair partner</p>
        </div>
      </div>
    </body>
  </html>
  `;
};

// Repair Status Update (Customer)
export const repairStatusEmailTemplate = (itemType, status, updates) => {
  const statusEmoji =
    {
      pending: "⏳",
      in_progress: "🚧",
      completed: "🎉",
    }[status] || "📦";

  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <title>${statusEmoji} Repair Update - FixItHub</title>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="emoji">${statusEmoji}</div>
          <h1 class="logo">FixItHub</h1>
        </div>
        
        <div class="content">
          <p>Hi there! 👋 Your <span class="highlight">${itemType}</span> repair status has changed:</p>
          
          <div class="status-box">
            <p style="font-size: 24px;">${statusEmoji} ${status.replace("_", " ").toUpperCase()}</p>
            ${updates ? `<p>📝 Latest update: ${updates[updates.length - 1]?.status || ""}</p>` : ""}
          </div>

          <div class="social-links">
            <a href="${process.env.CLIENT_URL}/dashboard/repairs" 
               class="social-link" 
               style="background: #4f46e5; color: white;">
              Track Repair Progress 🚚
            </a>
          </div>
        </div>

        <div class="footer">
          <p>Need assistance? We're here to help! 💬</p>
          <p>© ${new Date().getFullYear()} FixItHub | 24/7 Support</p>
        </div>
      </div>
    </body>
  </html>
  `;
};
