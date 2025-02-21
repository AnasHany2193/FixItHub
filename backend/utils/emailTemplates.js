// utils/emailTemplates.js

/**
 * Generates the HTML for the verification email.
 * @param {string} otpCode - The OTP code to be included in the email.
 * @returns {string} - HTML string for the verification email.
 */
export const verificationEmailTemplate = (otpCode) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🔐 FixItHub Account Verification</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
      body {
        margin: 0;
        padding: 0;
        background: #f8fafc;
        font-family: 'Inter', Arial, sans-serif;
      }
      .container {
        max-width: 680px;
        margin: 2rem auto;
        background: #ffffff;
        border-radius: 16px;
        box-shadow: 0 4px 24px rgba(99, 102, 241, 0.08);
      }
      .header {
        background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
        padding: 2.5rem;
        border-radius: 16px 16px 0 0;
        text-align: center;
      }
      .brand {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        color: white;
        font-size: 1.875rem;
        font-weight: 700;
      }
      .content {
        padding: 2.5rem;
        color: #1e293b;
      }
      .otp-container {
        background: #f1f5f9;
        border-radius: 12px;
        padding: 1.5rem;
        margin: 2rem 0;
        text-align: center;
      }
      .otp-code {
        font-size: 2.5rem;
        font-weight: 700;
        color: #4f46e5;
        letter-spacing: 0.25em;
        margin: 1rem 0;
      }
      .security-note {
        color: #64748b;
        font-size: 0.875rem;
        margin: 1.5rem 0;
      }
      .footer {
        background: #f1f5f9;
        padding: 1.5rem;
        text-align: center;
        border-radius: 0 0 16px 16px;
      }
      .disclaimer {
        font-size: 0.75rem;
        color: #64748b;
        line-height: 1.5;
        max-width: 560px;
        margin: 0 auto;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="brand">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 0L0 16L16 32L32 16L16 0Z" fill="white"/>
            <path d="M16 8L8 16L16 24L24 16L16 8Z" fill="#4F46E5"/>
          </svg>
          FixItHub Pro
        </div>
      </div>

      <div class="content">
        <h2 style="margin: 0 0 1.5rem; font-size: 1.5rem; color: #1e293b;">
          Account Verification Required
        </h2>
        
        <p style="margin: 0 0 1rem; line-height: 1.6;">
          Dear Valued User,<br>
          To complete your registration with FixItHub, please use the following
          One-Time Password (OTP) to verify your email address:
        </p>

        <div class="otp-container">
          <div class="otp-code">${otpCode}</div>
          <p style="margin: 0; color: #64748b;">
            Valid for 10 minutes ⏳
          </p>
        </div>

        <div class="security-note">
          🔒 Security Notice: Never share this code with anyone. FixItHub will never ask 
          for your password or verification codes.
        </div>

        <div style="border-top: 1px solid #e2e8f0; margin: 2rem 0; padding-top: 1.5rem;">
          <h3 style="margin: 0 0 1rem; font-size: 1.125rem;">Need Assistance?</h3>
          <p style="margin: 0; line-height: 1.6;">
            Contact our support team at 
            <a href="mailto:support@fixithub.com" style="color: #4f46e5; text-decoration: none;">
              support@fixithub.com
            </a> or visit our 
            <a href="https://fixithub.com/help" style="color: #4f46e5; text-decoration: none;">
              Help Center
            </a>
          </p>
        </div>
      </div>

      <div class="footer">
        <div class="disclaimer">
          This email was sent to you as part of your FixItHub account registration.
          © ${new Date().getFullYear()} FixItHub Technologies. All rights reserved.<br>
          [Company Address] | <a href="https://fixithub.com/privacy" style="color: #4f46e5;">Privacy Policy</a>
        </div>
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
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🔐 New Verification Code Issued | FixItHub Security</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
      body {
        margin: 0;
        padding: 0;
        background: #f8fafc;
        font-family: 'Inter', Arial, sans-serif;
      }
      .container {
        max-width: 680px;
        margin: 2rem auto;
        background: #ffffff;
        border-radius: 16px;
        box-shadow: 0 4px 24px rgba(99, 102, 241, 0.08);
      }
      .header {
        background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
        padding: 2.5rem;
        border-radius: 16px 16px 0 0;
        text-align: center;
      }
      .brand {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        color: white;
        font-size: 1.875rem;
        font-weight: 700;
      }
      .content {
        padding: 2.5rem;
        color: #1e293b;
      }
      .otp-container {
        background: #f1f5f9;
        border-radius: 12px;
        padding: 1.5rem;
        margin: 2rem 0;
        text-align: center;
      }
      .otp-code {
        font-size: 2.5rem;
        font-weight: 700;
        color: #4f46e5;
        letter-spacing: 0.25em;
        margin: 1rem 0;
      }
      .security-alert {
        background: #fff3cd;
        border-left: 4px solid #ffc107;
        padding: 1.25rem;
        border-radius: 8px;
        margin: 2rem 0;
        color: #856404;
      }
      .alert-icon {
        font-size: 1.25rem;
        margin-right: 0.5rem;
      }
      .footer {
        background: #f1f5f9;
        padding: 1.5rem;
        text-align: center;
        border-radius: 0 0 16px 16px;
      }
      .disclaimer {
        font-size: 0.75rem;
        color: #64748b;
        line-height: 1.5;
        max-width: 560px;
        margin: 0 auto;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="brand">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 0L0 16L16 32L32 16L16 0Z" fill="white"/>
            <path d="M16 8L8 16L16 24L24 16L16 8Z" fill="#4F46E5"/>
          </svg>
          FixItHub Security
        </div>
      </div>

      <div class="content">
        <h2 style="margin: 0 0 1.5rem; font-size: 1.5rem; color: #1e293b;">
          New Verification Code Issued
        </h2>
        
        <p style="margin: 0 0 1rem; line-height: 1.6;">
          We received a request for a new verification code. Below is your updated One-Time Password (OTP):
        </p>

        <div class="otp-container">
          <div class="otp-code">${otpCode}</div>
          <p style="margin: 0; color: #64748b;">
            Valid until: <strong style="color: #4f46e5;">${new Date(Date.now() + 600000).toLocaleTimeString()}</strong>
          </p>
        </div>

        <div class="security-alert">
          <span class="alert-icon">⚠️</span>
          <strong>Security Advisory:</strong> If you didn't request this code:
          <ol style="margin: 0.5rem 0 0 1.5rem; padding-left: 1rem;">
            <li>Immediately change your account password</li>
            <li>Contact our security team at 
              <a href="mailto:security@fixithub.com" style="color: #4f46e5; text-decoration: none;">
                security@fixithub.com
              </a>
            </li>
            <li>Review recent account activity</li>
          </ol>
        </div>

        <div style="border-top: 1px solid #e2e8f0; margin: 2rem 0; padding-top: 1.5rem;">
          <h3 style="margin: 0 0 1rem; font-size: 1.125rem;">Verification Support</h3>
          <p style="margin: 0; line-height: 1.6;">
            Need help? Contact our verification team:<br>
            📞 <a href="tel:+1234567890" style="color: #4f46e5; text-decoration: none;">+1 (234) 567-890</a> | 
            ✉️ <a href="mailto:verify@fixithub.com" style="color: #4f46e5; text-decoration: none;">verify@fixithub.com</a>
          </p>
        </div>
      </div>

      <div class="footer">
        <div class="disclaimer">
          This code was generated in response to a verification request. 
          © ${new Date().getFullYear()} FixItHub Security Operations.<br>
          123 Security Lane, Tech Valley | 
          <a href="https://fixithub.com/privacy" style="color: #4f46e5;">Privacy Policy</a> | 
          <a href="https://fixithub.com/security" style="color: #4f46e5;">Security Center</a>
        </div>
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
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to FixItHub - Your Repair Journey Begins</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
    body {
      margin: 0;
      padding: 0;
      background: #f8fafc;
      font-family: 'Inter', Arial, sans-serif;
    }
    .container {
      max-width: 680px;
      margin: 2rem auto;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 4px 24px rgba(99, 102, 241, 0.08);
    }
    .header {
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      padding: 2.5rem;
      border-radius: 16px 16px 0 0;
      text-align: center;
    }
    .brand {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      color: white;
      font-size: 1.875rem;
      font-weight: 700;
    }
    .welcome-graphic {
      width: 150px;
      margin: 1.5rem auto;
    }
    .content {
      padding: 2.5rem;
      color: #1e293b;
      line-height: 1.6;
    }
    .cta-button {
      display: inline-block;
      background: #4f46e5;
      color: white !important;
      padding: 1rem 2rem;
      border-radius: 12px;
      text-decoration: none;
      margin: 2rem 0;
      font-weight: 600;
      transition: background-color 0.2s ease;
    }
    .cta-button:hover {
      background: #6366f1;
    }
    .features {
      margin: 2rem 0;
      padding: 0;
      list-style: none;
    }
    .feature-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin: 1.5rem 0;
      padding: 1.5rem;
      background: #f8fafc;
      border-radius: 12px;
    }
    .feature-icon {
      width: 40px;
      height: 40px;
      background: #e0e7ff;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .security-note {
      background: #f1f5f9;
      border-left: 4px solid #4f46e5;
      padding: 1.5rem;
      border-radius: 8px;
      margin: 2rem 0;
    }
    .footer {
      background: #f1f5f9;
      padding: 1.5rem;
      text-align: center;
      border-radius: 0 0 16px 16px;
    }
    .disclaimer {
      font-size: 0.75rem;
      color: #64748b;
      line-height: 1.5;
      max-width: 560px;
      margin: 0 auto;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0L0 16L16 32L32 16L16 0Z" fill="white"/>
          <path d="M16 8L8 16L16 24L24 16L16 8Z" fill="#4F46E5"/>
        </svg>
        FixItHub Pro
      </div>
      <img src="https://example.com/welcome-illustration.svg" alt="Welcome" class="welcome-graphic">
    </div>

    <div class="content">
      <h2 style="margin: 0 0 1.5rem; font-size: 1.5rem; color: #1e293b;">
        Welcome to FixItHub, ${userName}!
      </h2>
      
      <p style="margin: 0 0 1rem;">We're excited to have you join our community of problem-solvers and skilled technicians. Your account is now ready to use!</p>

      <div style="text-align: center">
        <a href="https://app.fixithub.com/dashboard" class="cta-button">
          Launch Your Dashboard
        </a>
      </div>

      <h3 style="margin: 2rem 0 1rem; font-size: 1.25rem; color: #1e293b;">
        Get Started Quickly
      </h3>
      <ul class="features">
        <li class="feature-item">
          <div class="feature-icon">🔧</div>
          <div>
            <strong>Create Repair Requests</strong><br>
            Submit detailed repair jobs in minutes
          </div>
        </li>
        <li class="feature-item">
          <div class="feature-icon">📱</div>
          <div>
            <strong>Real-Time Tracking</strong><br>
            Monitor your repair status 24/7
          </div>
        </li>
        <li class="feature-item">
          <div class="feature-icon">💬</div>
          <div>
            <strong>Expert Communication</strong><br>
            Chat directly with certified technicians
          </div>
        </li>
      </ul>

      <div class="security-note">
        <strong>🔒 Account Security:</strong><br>
        • Enable two-factor authentication<br>
        • Review connected devices regularly<br>
        • Report suspicious activity immediately
      </div>

      <div style="border-top: 1px solid #e2e8f0; margin: 2rem 0; padding-top: 1.5rem;">
        <h3 style="margin: 0 0 1rem; font-size: 1.125rem;">Need Assistance?</h3>
        <p style="margin: 0; line-height: 1.6;">
          Visit our <a href="https://fixithub.com/support" style="color: #4f46e5; text-decoration: none;">Help Center</a> or 
          email <a href="mailto:support@fixithub.com" style="color: #4f46e5; text-decoration: none;">support@fixithub.com</a>
        </p>
      </div>
    </div>

    <div class="footer">
      <div class="disclaimer">
        <p>© ${new Date().getFullYear()} FixItHub Technologies<br>
        123 Repair Lane, Tech Valley | 
        <a href="https://fixithub.com/privacy" style="color: #4f46e5;">Privacy Policy</a> | 
        <a href="https://fixithub.com/terms" style="color: #4f46e5;">Terms of Service</a></p>
        <p style="margin-top: 1rem;">This email was sent to ${userName} as part of your FixItHub membership</p>
      </div>
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
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🔐 Password Reset Authorization | FixItHub Security</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
    body {
      margin: 0;
      padding: 0;
      background: #f8fafc;
      font-family: 'Inter', Arial, sans-serif;
    }
    .container {
      max-width: 680px;
      margin: 2rem auto;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 4px 24px rgba(99, 102, 241, 0.08);
    }
    .header {
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      padding: 2.5rem;
      border-radius: 16px 16px 0 0;
      text-align: center;
    }
    .brand {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      color: white;
      font-size: 1.875rem;
      font-weight: 700;
    }
    .content {
      padding: 2.5rem;
      color: #1e293b;
    }
    .otp-container {
      background: #f1f5f9;
      border-radius: 12px;
      padding: 1.5rem;
      margin: 2rem 0;
      text-align: center;
    }
    .otp-code {
      font-size: 2.5rem;
      font-weight: 700;
      color: #4f46e5;
      letter-spacing: 0.25em;
      margin: 1rem 0;
    }
    .security-alert {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 1.25rem;
      border-radius: 8px;
      margin: 2rem 0;
      color: #856404;
    }
    .security-list {
      margin: 2rem 0;
      padding: 0;
      list-style: none;
    }
    .security-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin: 1rem 0;
      padding: 1rem;
      background: #f8fafc;
      border-radius: 8px;
    }
    .footer {
      background: #f1f5f9;
      padding: 1.5rem;
      text-align: center;
      border-radius: 0 0 16px 16px;
    }
    .disclaimer {
      font-size: 0.75rem;
      color: #64748b;
      line-height: 1.5;
      max-width: 560px;
      margin: 0 auto;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0L0 16L16 32L32 16L16 0Z" fill="white"/>
          <path d="M16 8L8 16L16 24L24 16L16 8Z" fill="#4F46E5"/>
        </svg>
        FixItHub Security
      </div>
    </div>

    <div class="content">
      <h2 style="margin: 0 0 1.5rem; font-size: 1.5rem; color: #1e293b;">
        Password Reset Authorization
      </h2>
      
      <p style="margin: 0 0 1rem; line-height: 1.6;">
        We received a password reset request for your account. Use this verification code within the next 10 minutes:
      </p>

      <div class="otp-container">
        <div class="otp-code">${otpCode}</div>
        <p style="margin: 0; color: #64748b;">
          Expires: <strong style="color: #4f46e5;">${new Date(Date.now() + 600000).toLocaleTimeString()}</strong>
        </p>
      </div>

      <div class="security-alert">
        <strong>Security Notice:</strong> If you didn't initiate this request:
        <ol style="margin: 0.5rem 0 0 1.5rem; padding-left: 1rem;">
          <li>Immediately change your account password</li>
          <li>Contact our security team at 
            <a href="mailto:security@fixithub.com" style="color: #4f46e5; text-decoration: none;">
              security@fixithub.com
            </a>
          </li>
          <li>Review recent account activity</li>
        </ol>
      </div>

      <h3 style="margin: 2rem 0 1rem; font-size: 1.25rem; color: #1e293b;">
        Account Protection Tips
      </h3>
      <ul class="security-list">
        <li class="security-item">
          <div>🔒</div>
          <div>Enable two-factor authentication</div>
        </li>
        <li class="security-item">
          <div>🔄</div>
          <div>Update passwords every 90 days</div>
        </li>
        <li class="security-item">
          <div>📱</div>
          <div>Review connected devices regularly</div>
        </li>
      </ul>

      <div style="border-top: 1px solid #e2e8f0; margin: 2rem 0; padding-top: 1.5rem;">
        <h3 style="margin: 0 0 1rem; font-size: 1.125rem;">Verification Support</h3>
        <p style="margin: 0; line-height: 1.6;">
          Need assistance? Contact our verification team:<br>
          📞 <a href="tel:+1234567890" style="color: #4f46e5; text-decoration: none;">+1 (234) 567-890</a> | 
          ✉️ <a href="mailto:verify@fixithub.com" style="color: #4f46e5; text-decoration: none;">verify@fixithub.com</a>
        </p>
      </div>
    </div>

    <div class="footer">
      <div class="disclaimer">
        <p>© ${new Date().getFullYear()} FixItHub Security Operations<br>
        123 Security Lane, Tech Valley | 
        <a href="https://fixithub.com/privacy" style="color: #4f46e5;">Privacy Policy</a> | 
        <a href="https://fixithub.com/security" style="color: #4f46e5;">Security Center</a></p>
        <p style="margin-top: 1rem;">This authorization code was generated in response to a password reset request</p>
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
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🔐 Password Reset Confirmation | FixItHub Security</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
    body {
      margin: 0;
      padding: 0;
      background: #f8fafc;
      font-family: 'Inter', Arial, sans-serif;
    }
    .container {
      max-width: 680px;
      margin: 2rem auto;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 4px 24px rgba(99, 102, 241, 0.08);
    }
    .header {
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      padding: 2.5rem;
      border-radius: 16px 16px 0 0;
      text-align: center;
    }
    .brand {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      color: white;
      font-size: 1.875rem;
      font-weight: 700;
    }
    .content {
      padding: 2.5rem;
      color: #1e293b;
    }
    .success-alert {
      background: #f0fdf4;
      border-left: 4px solid #22c55e;
      padding: 1.5rem;
      border-radius: 8px;
      margin: 2rem 0;
    }
    .security-alert {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 1.5rem;
      border-radius: 8px;
      margin: 2rem 0;
    }
    .security-list {
      margin: 2rem 0;
      padding: 0;
      list-style: none;
    }
    .security-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin: 1rem 0;
      padding: 1rem;
      background: #f8fafc;
      border-radius: 8px;
    }
    .footer {
      background: #f1f5f9;
      padding: 1.5rem;
      text-align: center;
      border-radius: 0 0 16px 16px;
    }
    .disclaimer {
      font-size: 0.75rem;
      color: #64748b;
      line-height: 1.5;
      max-width: 560px;
      margin: 0 auto;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0L0 16L16 32L32 16L16 0Z" fill="white"/>
          <path d="M16 8L8 16L16 24L24 16L16 8Z" fill="#4F46E5"/>
        </svg>
        FixItHub Security
      </div>
    </div>

    <div class="content">
      <h2 style="margin: 0 0 1.5rem; font-size: 1.5rem; color: #1e293b;">
        Password Successfully Reset
      </h2>

      <div class="success-alert">
        <strong>✅ Confirmation:</strong> Your password was updated on 
        <strong>${new Date().toLocaleDateString()}</strong> at 
        <strong>${new Date().toLocaleTimeString()}</strong>
      </div>

      <div class="security-alert">
        <strong>⚠️ Security Check:</strong> If you didn't make this change:
        <ol style="margin: 0.5rem 0 0 1.5rem; padding-left: 1rem;">
          <li>Contact our security team immediately</li>
          <li>Change your password again</li>
          <li>Review account activity</li>
        </ol>
      </div>

      <h3 style="margin: 2rem 0 1rem; font-size: 1.25rem; color: #1e293b;">
        Enhanced Security Recommendations
      </h3>
      <ul class="security-list">
        <li class="security-item">
          <div>🔐</div>
          <div>Enable two-factor authentication</div>
        </li>
        <li class="security-item">
          <div>🔄</div>
          <div>Set password reminders every 90 days</div>
        </li>
        <li class="security-item">
          <div>📧</div>
          <div>Update recovery email regularly</div>
        </li>
      </ul>

      <div style="border-top: 1px solid #e2e8f0; margin: 2rem 0; padding-top: 1.5rem;">
        <h3 style="margin: 0 0 1rem; font-size: 1.125rem;">Security Support</h3>
        <p style="margin: 0; line-height: 1.6;">
          Contact our team: 📞 <a href="tel:+1234567890" style="color: #4f46e5; text-decoration: none;">+1 (234) 567-890</a><br>
          Or email: ✉️ <a href="mailto:security@fixithub.com" style="color: #4f46e5; text-decoration: none;">security@fixithub.com</a>
        </p>
      </div>
    </div>

    <div class="footer">
      <div class="disclaimer">
        <p>© ${new Date().getFullYear()} FixItHub Security Operations<br>
        123 Security Lane, Tech Valley | 
        <a href="https://fixithub.com/privacy" style="color: #4f46e5;">Privacy Policy</a> | 
        <a href="https://fixithub.com/security" style="color: #4f46e5;">Security Center</a></p>
        <p style="margin-top: 1rem;">This notification was sent to ${userName}@fixithub.com</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
};

export const workerApprovalEmailTemplate = (
  userName = "User",
  status = "approved",
  reason = ""
) => {
  const isApproved = status === "approved";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isApproved ? "Application Approved" : "Application Update"} | FixItHub Pro</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
    :root {
      --approved: #4f46e5;
      --rejected: #dc2626;
    }
    body {
      margin: 0;
      padding: 0;
      background: #f8fafc;
      font-family: 'Inter', Arial, sans-serif;
    }
    .container {
      max-width: 680px;
      margin: 2rem auto;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 4px 24px rgba(99, 102, 241, 0.08);
    }
    .header {
      background: linear-gradient(135deg, 
        ${isApproved ? "#6366f1 0%, #4f46e5 100%" : "#ef4444 0%, #dc2626 100%"}
      );
      padding: 2.5rem;
      border-radius: 16px 16px 0 0;
      text-align: center;
    }
    .brand {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      color: white;
      font-size: 1.875rem;
      font-weight: 700;
    }
    .status-alert {
      background: ${isApproved ? "#f0f5ff" : "#fef2f2"};
      border-left: 4px solid ${isApproved ? "var(--approved)" : "var(--rejected)"};
      padding: 1.5rem;
      border-radius: 8px;
      margin: 2rem 0;
      color: ${isApproved ? "#1e3a8a" : "#7f1d1d"};
    }
    .feature-list {
      margin: 2rem 0;
      padding: 0;
      list-style: none;
    }
    .feature-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin: 1.5rem 0;
      padding: 1.5rem;
      background: #f8fafc;
      border-radius: 12px;
    }
    .cta-button {
      display: inline-block;
      background: ${isApproved ? "var(--approved)" : "var(--rejected)"};
      color: white !important;
      padding: 1rem 2rem;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      transition: opacity 0.2s ease;
    }
    .cta-button:hover {
      opacity: 0.9;
    }
    .footer {
      background: #f1f5f9;
      padding: 1.5rem;
      text-align: center;
      border-radius: 0 0 16px 16px;
    }
    .disclaimer {
      font-size: 0.75rem;
      color: #64748b;
      line-height: 1.5;
      max-width: 560px;
      margin: 0 auto;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0L0 16L16 32L32 16L16 0Z" fill="white"/>
          <path d="M16 8L8 16L16 24L24 16L16 8Z" fill="${isApproved ? "#4F46E5" : "#DC2626"}"/>
        </svg>
        FixItHub ${isApproved ? "Pro" : "Team"}
      </div>
    </div>

    <div style="padding: 2.5rem;">
      <div class="status-alert">
        <h2 style="margin: 0; font-size: 1.5rem;">
          ${isApproved ? "🎉 Congratulations ${userName}!" : "Application Update"}
        </h2>
        <p style="margin: 0.5rem 0 0;">
          ${
            isApproved
              ? "Your professional application has been approved!"
              : "We've reviewed your application"
          }
        </p>
        ${!isApproved && reason ? `<p style="margin: 0.5rem 0 0;"><strong>Feedback:</strong> ${reason}</p>` : ""}
      </div>

      ${
        isApproved
          ? `
        <h3 style="margin: 2rem 0 1rem; font-size: 1.25rem;">Next Steps</h3>
        <ul class="feature-list">
          <li class="feature-item">
            <div>📋</div>
            <div>
              <strong>Complete Your Profile</strong><br>
              Add certifications and service areas
            </div>
          </li>
          <li class="feature-item">
            <div>📅</div>
            <div>
              <strong>Set Availability</strong><br>
              Define your working hours and regions
            </div>
          </li>
          <li class="feature-item">
            <div>⭐</div>
            <div>
              <strong>Build Reputation</strong><br>
              Start accepting repair requests
            </div>
          </li>
        </ul>
      `
          : `
        <h3 style="margin: 2rem 0 1rem; font-size: 1.25rem;">Improvement Suggestions</h3>
        <ul class="feature-list">
          <li class="feature-item">
            <div>📝</div>
            <div>
              <strong>Review Requirements</strong><br>
              Ensure all documentation meets our standards
            </div>
          </li>
          <li class="feature-item">
            <div>📚</div>
            <div>
              <strong>Enhance Certifications</strong><br>
              Add relevant qualifications and training
            </div>
          </li>
          <li class="feature-item">
            <div>🔄</div>
            <div>
              <strong>Reapply in 30 Days</strong><br>
              We welcome updated applications
            </div>
          </li>
        </ul>
      `
      }

      <div style="text-align: center; margin: 2rem 0;">
        <a href="${process.env.BASE_URL}/dashboard" class="cta-button">
          ${isApproved ? "Launch Professional Dashboard" : "View Application Guidelines"}
        </a>
      </div>

      ${
        !isApproved
          ? `
        <div style="text-align: center; margin-top: 2rem;">
          <p>Need assistance? Contact our verification team:<br>
          📞 <a href="tel:+1234567890" style="color: #4f46e5;">+1 (234) 567-890</a> | 
          ✉️ <a href="mailto:verification@fixithub.com" style="color: #4f46e5;">verification@fixithub.com</a></p>
        </div>
      `
          : ""
      }
    </div>

    <div class="footer">
      <div class="disclaimer">
        <p>© ${new Date().getFullYear()} FixItHub Professionals Network<br>
        123 Service Lane, Tech Valley | 
        <a href="https://fixithub.com/terms" style="color: #4f46e5;">Terms of Service</a> | 
        <a href="https://fixithub.com/privacy" style="color: #4f46e5;">Privacy Policy</a></p>
        <p style="margin-top: 1rem;">This is an automated message - please do not reply directly</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
};

export const auctionExpiredEmailTemplate = ({
  itemType,
  auctionId,
  userName,
  hasBids,
  bidCount,
}) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${hasBids ? "🏆 Auction Closed" : "⏰ Auction Expired"} - FixItHub</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
    body {
      margin: 0;
      padding: 0;
      background: #f8fafc;
      font-family: 'Inter', Arial, sans-serif;
    }
    .container {
      max-width: 680px;
      margin: 2rem auto;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 4px 24px rgba(99, 102, 241, 0.08);
    }
    .header {
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      padding: 2.5rem;
      border-radius: 16px 16px 0 0;
      text-align: center;
    }
    .brand {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      color: white;
      font-size: 1.875rem;
      font-weight: 700;
    }
    .status-box {
      background: ${hasBids ? "#f0f5ff" : "#fef2f2"};
      border-left: 4px solid ${hasBids ? "#4f46e5" : "#dc2626"};
      padding: 1.5rem;
      border-radius: 8px;
      margin: 2rem 0;
    }
    .cta-button {
      display: inline-block;
      background: #4f46e5;
      color: white !important;
      padding: 1rem 2rem;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      transition: opacity 0.2s ease;
    }
    .cta-button:hover {
      opacity: 0.9;
    }
    .footer {
      background: #f1f5f9;
      padding: 1.5rem;
      text-align: center;
      border-radius: 0 0 16px 16px;
    }
    .disclaimer {
      font-size: 0.75rem;
      color: #64748b;
      line-height: 1.5;
      max-width: 560px;
      margin: 0 auto;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0L0 16L16 32L32 16L16 0Z" fill="white"/>
          <path d="M16 8L8 16L16 24L24 16L16 8Z" fill="#4F46E5"/>
        </svg>
        FixItHub Auctions
      </div>
    </div>

    <div style="padding: 2.5rem;">
      <h1 style="margin: 0 0 1.5rem; font-size: 1.5rem; color: #1e293b;">
        ${hasBids ? "🏆 Your ${itemType} Repair Auction Closed" : "⏰ Auction Expired - ${itemType}"}
      </h1>

      <div class="status-box">
        <h2 style="margin: 0 0 1rem; font-size: 1.25rem;">
          ${hasBids ? "Successful Auction" : "No Bids Received"}
        </h2>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
          <div>
            <div style="color: #64748b;">Auction ID</div>
            <div style="font-weight: 600; color: #4f46e5;">${auctionId}</div>
          </div>
          <div>
            <div style="color: #64748b;">Closed At</div>
            <div style="font-weight: 600;">${new Date().toLocaleString()}</div>
          </div>
          <div>
            <div style="color: #64748b;">Total Bids</div>
            <div style="font-weight: 600; color: ${hasBids ? "#4f46e5" : "#dc2626"};">${bidCount}</div>
          </div>
        </div>
      </div>

      ${
        hasBids
          ? `
        <div style="margin: 2rem 0;">
          <h3 style="margin: 0 0 1rem; font-size: 1.25rem;">Next Steps</h3>
          <ol style="margin: 0; padding-left: 1.5rem;">
            <li>Review bidder profiles and ratings</li>
            <li>Compare service proposals</li>
            <li>Select your preferred provider</li>
          </ol>
          <div style="text-align: center; margin: 2rem 0;">
            <a href="https://fixithub.com/auctions/${auctionId}" class="cta-button">
              View Bids & Select Provider →
            </a>
          </div>
        </div>
      `
          : `
        <div style="margin: 2rem 0;">
          <h3 style="margin: 0 0 1rem; font-size: 1.25rem;">Recommendations</h3>
          <ul style="margin: 0; padding-left: 1.5rem;">
            <li>📈 Adjust pricing strategy</li>
            <li>📝 Enhance service description</li>
            <li>⏱ Extend auction duration</li>
          </ul>
          <div style="text-align: center; margin: 2rem 0;">
            <a href="https://fixithub.com/repairs/new" class="cta-button">
              Repost Request →
            </a>
          </div>
        </div>
      `
      }

      <div class="footer">
        <div class="disclaimer">
          <p>© ${new Date().getFullYear()} FixItHub Auctions<br>
          123 Marketplace Street, Tech Valley | 
          <a href="https://fixithub.com/terms" style="color: #4f46e5;">Terms</a> | 
          <a href="https://fixithub.com/privacy" style="color: #4f46e5;">Privacy</a></p>
          <p style="margin-top: 1rem;">Need help? Contact our support team: 📞 <a href="tel:+1234567890" style="color: #4f46e5;">+1 (234) 567-890</a></p>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
`;

// Bid Accepted Notification (Worker)
export const bidAcceptedEmailTemplate = (itemType, price, customerName) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🎉 Bid Accepted | FixItHub Pro</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
    body {
      margin: 0;
      padding: 0;
      background: #f8fafc;
      font-family: 'Inter', Arial, sans-serif;
    }
    .container {
      max-width: 680px;
      margin: 2rem auto;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 4px 24px rgba(99, 102, 241, 0.08);
    }
    .header {
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      padding: 2.5rem;
      border-radius: 16px 16px 0 0;
      text-align: center;
    }
    .brand {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      color: white;
      font-size: 1.875rem;
      font-weight: 700;
    }
    .status-alert {
      background: #f0f5ff;
      border-left: 4px solid #4f46e5;
      padding: 1.5rem;
      border-radius: 8px;
      margin: 2rem 0;
    }
    .feature-list {
      margin: 2rem 0;
      padding: 0;
      list-style: none;
    }
    .feature-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin: 1.5rem 0;
      padding: 1.5rem;
      background: #f8fafc;
      border-radius: 12px;
    }
    .cta-button {
      display: inline-block;
      background: #4f46e5;
      color: white !important;
      padding: 1rem 2rem;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      transition: opacity 0.2s ease;
    }
    .cta-button:hover {
      opacity: 0.9;
    }
    .footer {
      background: #f1f5f9;
      padding: 1.5rem;
      text-align: center;
      border-radius: 0 0 16px 16px;
    }
    .disclaimer {
      font-size: 0.75rem;
      color: #64748b;
      line-height: 1.5;
      max-width: 560px;
      margin: 0 auto;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0L0 16L16 32L32 16L16 0Z" fill="white"/>
          <path d="M16 8L8 16L16 24L24 16L16 8Z" fill="#4F46E5"/>
        </svg>
        FixItHub Pro
      </div>
    </div>

    <div style="padding: 2.5rem;">
      <div class="status-alert">
        <h2 style="margin: 0; font-size: 1.5rem; color: #1e3a8a;">
          🎉 Bid Accepted - ${itemType}
        </h2>
        <p style="margin: 0.5rem 0 0;">
          Congratulations! ${customerName} has accepted your bid
        </p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin: 2rem 0;">
        <div>
          <div style="color: #64748b;">Accepted Price</div>
          <div style="font-size: 1.5rem; font-weight: 600; color: #4f46e5;">$${price}</div>
        </div>
        <div>
          <div style="color: #64748b;">Service Type</div>
          <div style="font-size: 1.5rem; font-weight: 600;">${itemType}</div>
        </div>
      </div>

      <h3 style="margin: 2rem 0 1rem; font-size: 1.25rem;">Next Steps</h3>
      <ul class="feature-list">
        <li class="feature-item">
          <div>💬</div>
          <div>
            <strong>Contact Customer</strong><br>
            Initiate communication via our secure chat
          </div>
        </li>
        <li class="feature-item">
          <div>📝</div>
          <div>
            <strong>Confirm Details</strong><br>
            Review and finalize service specifications
          </div>
        </li>
        <li class="feature-item">
          <div>📅</div>
          <div>
            <strong>Schedule Service</strong><br>
            Agree on timeline and milestones
          </div>
        </li>
      </ul>

      <div style="text-align: center; margin: 2rem 0;">
        <a href="${process.env.CLIENT_URL}/dashboard/repairs" class="cta-button">
          Access Repair Dashboard →
        </a>
      </div>
    </div>

    <div class="footer">
      <div class="disclaimer">
        <p>© ${new Date().getFullYear()} FixItHub Pro Services<br>
        123 Service Lane, Tech Valley | 
        <a href="https://fixithub.com/terms" style="color: #4f46e5;">Service Terms</a> | 
        <a href="https://fixithub.com/privacy" style="color: #4f46e5;">Privacy Policy</a></p>
        <p style="margin-top: 1rem;">Need help? Contact support: 📞 <a href="tel:+1234567890" style="color: #4f46e5;">+1 (234) 567-890</a></p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
};

// Repair Status Update (Customer)
export const repairStatusEmailTemplate = (itemType, status, updates) => {
  const statusConfig = {
    pending: { emoji: "⏳", color: "#3b82f6", label: "Pending Review" },
    in_progress: { emoji: "🛠️", color: "#f59e0b", label: "In Progress" },
    completed: { emoji: "✅", color: "#10b981", label: "Completed" },
    default: { emoji: "📦", color: "#4f46e5", label: "Status Update" },
  };

  const { emoji, color, label } = statusConfig[status] || statusConfig.default;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${label} - FixItHub</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
    body {
      margin: 0;
      padding: 0;
      background: #f8fafc;
      font-family: 'Inter', Arial, sans-serif;
    }
    .container {
      max-width: 680px;
      margin: 2rem auto;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 4px 24px rgba(99, 102, 241, 0.08);
    }
    .header {
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      padding: 2.5rem;
      border-radius: 16px 16px 0 0;
      text-align: center;
    }
    .brand {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      color: white;
      font-size: 1.875rem;
      font-weight: 700;
    }
    .status-alert {
      background: ${color}15;
      border-left: 4px solid ${color};
      padding: 1.5rem;
      border-radius: 8px;
      margin: 2rem 0;
    }
    .update-list {
      margin: 2rem 0;
      padding: 0;
      list-style: none;
    }
    .update-item {
      display: flex;
      align-items: start;
      gap: 1rem;
      margin: 1.5rem 0;
      padding: 1.5rem;
      background: #f8fafc;
      border-radius: 12px;
    }
    .cta-button {
      display: inline-block;
      background: #4f46e5;
      color: white !important;
      padding: 1rem 2rem;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      transition: opacity 0.2s ease;
    }
    .cta-button:hover {
      opacity: 0.9;
    }
    .footer {
      background: #f1f5f9;
      padding: 1.5rem;
      text-align: center;
      border-radius: 0 0 16px 16px;
    }
    .disclaimer {
      font-size: 0.75rem;
      color: #64748b;
      line-height: 1.5;
      max-width: 560px;
      margin: 0 auto;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0L0 16L16 32L32 16L16 0Z" fill="white"/>
          <path d="M16 8L8 16L16 24L24 16L16 8Z" fill="#4F46E5"/>
        </svg>
        FixItHub Repairs
      </div>
    </div>

    <div style="padding: 2.5rem;">
      <div class="status-alert">
        <h2 style="margin: 0; font-size: 1.5rem; color: ${color};">
          ${emoji} ${label}
        </h2>
        <p style="margin: 0.5rem 0 0; color: #1e293b;">
          ${itemType} Repair Update
        </p>
      </div>

      ${
        updates?.length
          ? `
        <h3 style="margin: 2rem 0 1rem; font-size: 1.25rem;">Recent Updates</h3>
        <ul class="update-list">
          ${updates
            .slice(-2)
            .map(
              (update) => `
            <li class="update-item">
              <div>📅</div>
              <div>
                <strong>${new Date(update.timestamp).toLocaleDateString()}</strong><br>
                ${update.status || ""}
              </div>
            </li>
          `
            )
            .join("")}
        </ul>
      `
          : ""
      }

      <div style="text-align: center; margin: 2rem 0;">
        <a href="${process.env.CLIENT_URL}/dashboard/repairs" class="cta-button">
          View Detailed Progress →
        </a>
      </div>

      <div style="border-top: 1px solid #e2e8f0; padding-top: 1.5rem;">
        <h3 style="margin: 0 0 1rem; font-size: 1.125rem;">Need Assistance?</h3>
        <p style="margin: 0; line-height: 1.6;">
          Contact our support team: 📞 <a href="tel:+1234567890" style="color: #4f46e5;">+1 (234) 567-890</a><br>
          Or email: ✉️ <a href="mailto:support@fixithub.com" style="color: #4f46e5;">support@fixithub.com</a>
        </p>
      </div>
    </div>

    <div class="footer">
      <div class="disclaimer">
        <p>© ${new Date().getFullYear()} FixItHub Repair Services<br>
        123 Service Lane, Tech Valley | 
        <a href="https://fixithub.com/terms" style="color: #4f46e5;">Service Terms</a> | 
        <a href="https://fixithub.com/privacy" style="color: #4f46e5;">Privacy Policy</a></p>
        <p style="margin-top: 1rem;">This is an automated status notification</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
};

// Payment Success (Customer)
export const paymentSuccessEmailTemplate = (itemType, amount, repairId) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>✅ Payment Confirmed - FixItHub</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
    body {
      margin: 0;
      padding: 0;
      background: #f8fafc;
      font-family: 'Inter', Arial, sans-serif;
    }
    .container {
      max-width: 680px;
      margin: 2rem auto;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 4px 24px rgba(99, 102, 241, 0.08);
    }
    .header {
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      padding: 2.5rem;
      border-radius: 16px 16px 0 0;
      text-align: center;
    }
    .brand {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      color: white;
      font-size: 1.875rem;
      font-weight: 700;
    }
    .status-box {
      background: #f0fdf4;
      border-left: 4px solid #10b981;
      padding: 1.5rem;
      border-radius: 8px;
      margin: 2rem 0;
    }
    .detail-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      margin: 2rem 0;
    }
    .cta-button {
      display: inline-block;
      background: #4f46e5;
      color: white !important;
      padding: 1rem 2rem;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      transition: opacity 0.2s ease;
    }
    .cta-button:hover {
      opacity: 0.9;
    }
    .footer {
      background: #f1f5f9;
      padding: 1.5rem;
      text-align: center;
      border-radius: 0 0 16px 16px;
    }
    .disclaimer {
      font-size: 0.75rem;
      color: #64748b;
      line-height: 1.5;
      max-width: 560px;
      margin: 0 auto;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0L0 16L16 32L32 16L16 0Z" fill="white"/>
          <path d="M16 8L8 16L16 24L24 16L16 8Z" fill="#4F46E5"/>
        </svg>
        FixItHub Payments
      </div>
    </div>

    <div style="padding: 2.5rem;">
      <div class="status-box">
        <h2 style="margin: 0; font-size: 1.5rem; color: #10b981;">
          ✅ Payment Processed Successfully
        </h2>
        <p style="margin: 0.5rem 0 0; color: #1e293b;">
          Thank you for choosing FixItHub for your ${itemType} repair
        </p>
      </div>

      <div class="detail-grid">
        <div>
          <div style="color: #64748b;">Amount Paid</div>
          <div style="font-size: 1.5rem; font-weight: 600; color: #4f46e5;">$${amount}</div>
        </div>
        <div>
          <div style="color: #64748b;">Repair ID</div>
          <div style="font-size: 1.5rem; font-weight: 600;">${repairId}</div>
        </div>
        <div>
          <div style="color: #64748b;">Service Type</div>
          <div style="font-size: 1.1rem; font-weight: 500;">${itemType} Repair</div>
        </div>
        <div>
          <div style="color: #64748b;">Estimated Completion</div>
          <div style="font-size: 1.1rem; font-weight: 500;">3-5 Business Days</div>
        </div>
      </div>

      <div style="text-align: center; margin: 2rem 0;">
        <a href="${process.env.CLIENT_URL}/dashboard/repairs" class="cta-button">
          Track Repair Progress →
        </a>
      </div>

      <div style="border-top: 1px solid #e2e8f0; padding-top: 1.5rem;">
        <h3 style="margin: 0 0 1rem; font-size: 1.125rem;">Need Assistance?</h3>
        <p style="margin: 0; line-height: 1.6;">
          Contact our support team: 📞 <a href="tel:+1234567890" style="color: #4f46e5;">+1 (234) 567-890</a><br>
          Or email: ✉️ <a href="mailto:support@fixithub.com" style="color: #4f46e5;">support@fixithub.com</a>
        </p>
      </div>
    </div>

    <div class="footer">
      <div class="disclaimer">
        <p>© ${new Date().getFullYear()} FixItHub Financial Services<br>
        123 Secure Lane, Tech Valley | 
        <a href="https://fixithub.com/terms" style="color: #4f46e5;">Payment Terms</a> | 
        <a href="https://fixithub.com/privacy" style="color: #4f46e5;">Privacy Policy</a></p>
        <p style="margin-top: 1rem;">This is an official payment receipt - retain for your records</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

export const bidRejectedEmailTemplate = (itemType) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🔧 Bid Update - FixItHub Pro</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
    body {
      margin: 0;
      padding: 0;
      background: #f8fafc;
      font-family: 'Inter', Arial, sans-serif;
    }
    .container {
      max-width: 680px;
      margin: 2rem auto;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 4px 24px rgba(99, 102, 241, 0.08);
    }
    .header {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      padding: 2.5rem;
      border-radius: 16px 16px 0 0;
      text-align: center;
    }
    .brand {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      color: white;
      font-size: 1.875rem;
      font-weight: 700;
    }
    .status-alert {
      background: #fef2f2;
      border-left: 4px solid #dc2626;
      padding: 1.5rem;
      border-radius: 8px;
      margin: 2rem 0;
    }
    .improvement-list {
      margin: 2rem 0;
      padding: 0;
      list-style: none;
    }
    .improvement-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin: 1.5rem 0;
      padding: 1.5rem;
      background: #f8fafc;
      border-radius: 12px;
    }
    .cta-button {
      display: inline-block;
      background: #4f46e5;
      color: white !important;
      padding: 1rem 2rem;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      transition: opacity 0.2s ease;
    }
    .cta-button:hover {
      opacity: 0.9;
    }
    .footer {
      background: #f1f5f9;
      padding: 1.5rem;
      text-align: center;
      border-radius: 0 0 16px 16px;
    }
    .disclaimer {
      font-size: 0.75rem;
      color: #64748b;
      line-height: 1.5;
      max-width: 560px;
      margin: 0 auto;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0L0 16L16 32L32 16L16 0Z" fill="white"/>
          <path d="M16 8L8 16L16 24L24 16L16 8Z" fill="#DC2626"/>
        </svg>
        FixItHub Pro
      </div>
    </div>

    <div style="padding: 2.5rem;">
      <div class="status-alert">
        <h2 style="margin: 0; font-size: 1.5rem; color: #7f1d1d;">
          🔧 Bid Not Selected - ${itemType}
        </h2>
        <p style="margin: 0.5rem 0 0; color: #1e293b;">
          Your bid wasn't selected for this repair opportunity
        </p>
      </div>

      <h3 style="margin: 2rem 0 1rem; font-size: 1.25rem;">Improvement Suggestions</h3>
      <ul class="improvement-list">
        <li class="improvement-item">
          <div>💵</div>
          <div>
            <strong>Competitive Pricing</strong><br>
            Analyze market rates and adjust accordingly
          </div>
        </li>
        <li class="improvement-item">
          <div>📚</div>
          <div>
            <strong>Showcase Expertise</strong><br>
            Highlight certifications and past successes
          </div>
        </li>
        <li class="improvement-item">
          <div>⏱️</div>
          <div>
            <strong>Faster Turnaround</strong><br>
            Offer realistic but competitive timelines
          </div>
        </li>
      </ul>

      <div style="text-align: center; margin: 2rem 0;">
        <a href="${process.env.CLIENT_URL}/dashboard/opportunities" class="cta-button">
          View New Opportunities →
        </a>
      </div>

      <div style="border-top: 1px solid #e2e8f0; padding-top: 1.5rem;">
        <h3 style="margin: 0 0 1rem; font-size: 1.125rem;">Need Feedback?</h3>
        <p style="margin: 0; line-height: 1.6;">
          Contact our pro team: 📞 <a href="tel:+1234567890" style="color: #4f46e5;">+1 (234) 567-890</a><br>
          Email: ✉️ <a href="mailto:prosupport@fixithub.com" style="color: #4f46e5;">prosupport@fixithub.com</a>
        </p>
      </div>
    </div>

    <div class="footer">
      <div class="disclaimer">
        <p>© ${new Date().getFullYear()} FixItHub Pro Network<br>
        123 Service Lane, Tech Valley | 
        <a href="https://fixithub.com/terms" style="color: #4f46e5;">Service Terms</a> | 
        <a href="https://fixithub.com/privacy" style="color: #4f46e5;">Privacy Policy</a></p>
        <p style="margin-top: 1rem;">This notification does not affect your standing in our Pro Network</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

// Payment Failed (Customer)
export const paymentFailedEmailTemplate = (itemType, amount) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>⚠️ Payment Failed - FixItHub</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
    body {
      margin: 0;
      padding: 0;
      background: #f8fafc;
      font-family: 'Inter', Arial, sans-serif;
    }
    .container {
      max-width: 680px;
      margin: 2rem auto;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 4px 24px rgba(99, 102, 241, 0.08);
    }
    .header {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      padding: 2.5rem;
      border-radius: 16px 16px 0 0;
      text-align: center;
    }
    .brand {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      color: white;
      font-size: 1.875rem;
      font-weight: 700;
    }
    .status-alert {
      background: #fef2f2;
      border-left: 4px solid #dc2626;
      padding: 1.5rem;
      border-radius: 8px;
      margin: 2rem 0;
    }
    .detail-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      margin: 2rem 0;
    }
    .cta-button {
      display: inline-block;
      background: #4f46e5;
      color: white !important;
      padding: 1rem 2rem;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      transition: opacity 0.2s ease;
    }
    .cta-button:hover {
      opacity: 0.9;
    }
    .footer {
      background: #f1f5f9;
      padding: 1.5rem;
      text-align: center;
      border-radius: 0 0 16px 16px;
    }
    .disclaimer {
      font-size: 0.75rem;
      color: #64748b;
      line-height: 1.5;
      max-width: 560px;
      margin: 0 auto;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0L0 16L16 32L32 16L16 0Z" fill="white"/>
          <path d="M16 8L8 16L16 24L24 16L16 8Z" fill="#DC2626"/>
        </svg>
        FixItHub Payments
      </div>
    </div>

    <div style="padding: 2.5rem;">
      <div class="status-alert">
        <h2 style="margin: 0; font-size: 1.5rem; color: #7f1d1d;">
          ⚠️ Payment Processing Failed
        </h2>
        <p style="margin: 0.5rem 0 0; color: #1e293b;">
          We couldn't process your ${itemType} repair payment
        </p>
      </div>

      <div class="detail-grid">
        <div>
          <div style="color: #64748b;">Amount Due</div>
          <div style="font-size: 1.5rem; font-weight: 600; color: #dc2626;">$${amount}</div>
        </div>
        <div>
          <div style="color: #64748b;">Service Type</div>
          <div style="font-size: 1.5rem; font-weight: 600;">${itemType} Repair</div>
        </div>
      </div>

      <div style="text-align: center; margin: 2rem 0;">
        <a href="${process.env.CLIENT_URL}/dashboard/payment" class="cta-button">
          Update Payment Method →
        </a>
      </div>

      <div style="border-top: 1px solid #e2e8f0; padding-top: 1.5rem;">
        <h3 style="margin: 0 0 1rem; font-size: 1.125rem;">Need Assistance?</h3>
        <p style="margin: 0; line-height: 1.6;">
          Contact our support team: 📞 <a href="tel:+1234567890" style="color: #4f46e5;">+1 (234) 567-890</a><br>
          Or email: ✉️ <a href="mailto:support@fixithub.com" style="color: #4f46e5;">support@fixithub.com</a>
        </p>
      </div>
    </div>

    <div class="footer">
      <div class="disclaimer">
        <p>© ${new Date().getFullYear()} FixItHub Financial Services<br>
        123 Secure Lane, Tech Valley | 
        <a href="https://fixithub.com/terms" style="color: #4f46e5;">Payment Terms</a> | 
        <a href="https://fixithub.com/privacy" style="color: #4f46e5;">Privacy Policy</a></p>
        <p style="margin-top: 1rem;">This is an automated payment notification - your repair is on hold until payment is completed</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

// Worker Payment Notification
export const workerPaymentReceivedEmailTemplate = (itemType, amount) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>💰 Payment Secured - FixItHub Pro</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
    body {
      margin: 0;
      padding: 0;
      background: #f8fafc;
      font-family: 'Inter', Arial, sans-serif;
    }
    .container {
      max-width: 680px;
      margin: 2rem auto;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 4px 24px rgba(99, 102, 241, 0.08);
    }
    .header {
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      padding: 2.5rem;
      border-radius: 16px 16px 0 0;
      text-align: center;
    }
    .brand {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      color: white;
      font-size: 1.875rem;
      font-weight: 700;
    }
    .status-alert {
      background: #f0f5ff;
      border-left: 4px solid #4f46e5;
      padding: 1.5rem;
      border-radius: 8px;
      margin: 2rem 0;
    }
    .detail-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      margin: 2rem 0;
    }
    .cta-button {
      display: inline-block;
      background: #4f46e5;
      color: white !important;
      padding: 1rem 2rem;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      transition: opacity 0.2s ease;
    }
    .cta-button:hover {
      opacity: 0.9;
    }
    .footer {
      background: #f1f5f9;
      padding: 1.5rem;
      text-align: center;
      border-radius: 0 0 16px 16px;
    }
    .disclaimer {
      font-size: 0.75rem;
      color: #64748b;
      line-height: 1.5;
      max-width: 560px;
      margin: 0 auto;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0L0 16L16 32L32 16L16 0Z" fill="white"/>
          <path d="M16 8L8 16L16 24L24 16L16 8Z" fill="#4F46E5"/>
        </svg>
        FixItHub Payments
      </div>
    </div>

    <div style="padding: 2.5rem;">
      <div class="status-alert">
        <h2 style="margin: 0; font-size: 1.5rem; color: #1e3a8a;">
          🔒 Payment Secured - ${itemType}
        </h2>
        <p style="margin: 0.5rem 0 0; color: #1e293b;">
          Client payment verified - funds held in escrow
        </p>
      </div>

      <div class="detail-grid">
        <div>
          <div style="color: #64748b;">Payment Amount</div>
          <div style="font-size: 1.5rem; font-weight: 600; color: #4f46e5;">$${amount}</div>
        </div>
        <div>
          <div style="color: #64748b;">Service Type</div>
          <div style="font-size: 1.5rem; font-weight: 600;">${itemType} Repair</div>
        </div>
        <div>
          <div style="color: #64748b;">Release Timeline</div>
          <div style="font-size: 1.1rem; font-weight: 500;">After successful completion</div>
        </div>
        <div>
          <div style="color: #64748b;">Payment Method</div>
          <div style="font-size: 1.1rem; font-weight: 500;">Secure Escrow</div>
        </div>
      </div>

      <div style="text-align: center; margin: 2rem 0;">
        <a href="${process.env.CLIENT_URL}/dashboard/repairs" class="cta-button">
          Track Repair Progress →
        </a>
      </div>

      <div style="border-top: 1px solid #e2e8f0; padding-top: 1.5rem;">
        <h3 style="margin: 0 0 1rem; font-size: 1.125rem;">Payment Security</h3>
        <p style="margin: 0; line-height: 1.6;">
          Funds protected by FixItHub Escrow Service<br>
          Questions? Contact: 📞 <a href="tel:+1234567890" style="color: #4f46e5;">+1 (234) 567-890</a>
        </p>
      </div>
    </div>

    <div class="footer">
      <div class="disclaimer">
        <p>© ${new Date().getFullYear()} FixItHub Financial Services<br>
        123 Secure Lane, Tech Valley | 
        <a href="https://fixithub.com/terms" style="color: #4f46e5;">Escrow Terms</a> | 
        <a href="https://fixithub.com/privacy" style="color: #4f46e5;">Privacy Policy</a></p>
        <p style="margin-top: 1rem;">This is an automated payment notification - funds will be released after client approval</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

export const productPaymentSuccessTemplate = (reservation) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>✅ Order Confirmed - FixItHub Marketplace</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
    body {
      margin: 0;
      padding: 0;
      background: #f8fafc;
      font-family: 'Inter', Arial, sans-serif;
    }
    .container {
      max-width: 680px;
      margin: 2rem auto;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 4px 24px rgba(99, 102, 241, 0.08);
    }
    .header {
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      padding: 2.5rem;
      border-radius: 16px 16px 0 0;
      text-align: center;
    }
    .brand {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      color: white;
      font-size: 1.875rem;
      font-weight: 700;
    }
    .status-box {
      background: #f0fdf4;
      border-left: 4px solid #10b981;
      padding: 1.5rem;
      border-radius: 8px;
      margin: 2rem 0;
    }
    .order-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      margin: 2rem 0;
    }
    .cta-button {
      display: inline-block;
      background: #4f46e5;
      color: white !important;
      padding: 1rem 2rem;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      transition: opacity 0.2s ease;
    }
    .cta-button:hover {
      opacity: 0.9;
    }
    .footer {
      background: #f1f5f9;
      padding: 1.5rem;
      text-align: center;
      border-radius: 0 0 16px 16px;
    }
    .disclaimer {
      font-size: 0.75rem;
      color: #64748b;
      line-height: 1.5;
      max-width: 560px;
      margin: 0 auto;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0L0 16L16 32L32 16L16 0Z" fill="white"/>
          <path d="M16 8L8 16L16 24L24 16L16 8Z" fill="#4F46E5"/>
        </svg>
        FixItHub Marketplace
      </div>
    </div>

    <div style="padding: 2.5rem;">
      <div class="status-box">
        <h2 style="margin: 0; font-size: 1.5rem; color: #10b981;">
          ✅ Order #${reservation._id} Confirmed
        </h2>
        <p style="margin: 0.5rem 0 0; color: #1e293b;">
          Thank you for your purchase!
        </p>
      </div>

      <div class="order-grid">
        <div>
          <div style="color: #64748b;">Product</div>
          <div style="font-size: 1.25rem; font-weight: 600;">${reservation.product.title}</div>
        </div>
        <div>
          <div style="color: #64748b;">Quantity</div>
          <div style="font-size: 1.25rem; font-weight: 600;">${reservation.quantity}</div>
        </div>
        <div>
          <div style="color: #64748b;">Unit Price</div>
          <div style="font-size: 1.25rem; font-weight: 600;">$${reservation.product.price.toFixed(2)}</div>
        </div>
        <div>
          <div style="color: #64748b;">Total Paid</div>
          <div style="font-size: 1.25rem; font-weight: 600; color: #4f46e5;">
            $${(reservation.product.price * reservation.quantity).toFixed(2)}
          </div>
        </div>
      </div>

      <div style="text-align: center; margin: 2rem 0;">
        <a href="${process.env.CLIENT_URL}/orders/${reservation._id}" class="cta-button">
          Track Your Order →
        </a>
      </div>

      <div style="border-top: 1px solid #e2e8f0; padding-top: 1.5rem;">
        <h3 style="margin: 0 0 1rem; font-size: 1.125rem;">Next Steps</h3>
        <ul style="margin: 0; padding-left: 1.5rem;">
          <li>Order verification in progress</li>
          <li>Shipping confirmation within 24 hours</li>
          <li>Quality inspection before dispatch</li>
        </ul>
      </div>
    </div>

    <div class="footer">
      <div class="disclaimer">
        <p>© ${new Date().getFullYear()} FixItHub Marketplace<br>
        123 Commerce Street, Tech Valley | 
        <a href="https://fixithub.com/terms" style="color: #4f46e5;">Terms of Sale</a> | 
        <a href="https://fixithub.com/privacy" style="color: #4f46e5;">Privacy Policy</a></p>
        <p style="margin-top: 1rem;">Need help? Contact support: 📞 <a href="tel:+1234567890" style="color: #4f46e5;">+1 (234) 567-890</a></p>
      </div>
    </div>
  </div>
</body>
</html>
`;

export const workerNewOrderTemplate = (reservation) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🛒 New Order Received - FixItHub Pro</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
    body {
      margin: 0;
      padding: 0;
      background: #f8fafc;
      font-family: 'Inter', Arial, sans-serif;
    }
    .container {
      max-width: 680px;
      margin: 2rem auto;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 4px 24px rgba(99, 102, 241, 0.08);
    }
    .header {
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      padding: 2.5rem;
      border-radius: 16px 16px 0 0;
      text-align: center;
    }
    .brand {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      color: white;
      font-size: 1.875rem;
      font-weight: 700;
    }
    .status-alert {
      background: #f0f5ff;
      border-left: 4px solid #4f46e5;
      padding: 1.5rem;
      border-radius: 8px;
      margin: 2rem 0;
    }
    .order-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      margin: 2rem 0;
    }
    .cta-button {
      display: inline-block;
      background: #4f46e5;
      color: white !important;
      padding: 1rem 2rem;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      transition: opacity 0.2s ease;
    }
    .cta-button:hover {
      opacity: 0.9;
    }
    .footer {
      background: #f1f5f9;
      padding: 1.5rem;
      text-align: center;
      border-radius: 0 0 16px 16px;
    }
    .disclaimer {
      font-size: 0.75rem;
      color: #64748b;
      line-height: 1.5;
      max-width: 560px;
      margin: 0 auto;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0L0 16L16 32L32 16L16 0Z" fill="white"/>
          <path d="M16 8L8 16L16 24L24 16L16 8Z" fill="#4F46E5"/>
        </svg>
        FixItHub Pro
      </div>
    </div>

    <div style="padding: 2.5rem;">
      <div class="status-alert">
        <h2 style="margin: 0; font-size: 1.5rem; color: #1e3a8a;">
          🚚 New Order Received
        </h2>
        <p style="margin: 0.5rem 0 0; color: #1e293b;">
          Order ID: #${reservation._id}
        </p>
      </div>

      <div class="order-grid">
        <div>
          <div style="color: #64748b;">Customer</div>
          <div style="font-size: 1.25rem; font-weight: 600;">${reservation.user.username}</div>
        </div>
        <div>
          <div style="color: #64748b;">Order Date</div>
          <div style="font-size: 1.25rem; font-weight: 600;">${new Date(reservation.createdAt).toLocaleDateString()}</div>
        </div>
        <div>
          <div style="color: #64748b;">Product</div>
          <div style="font-size: 1.25rem; font-weight: 600;">${reservation.product.title}</div>
        </div>
        <div>
          <div style="color: #64748b;">Quantity</div>
          <div style="font-size: 1.25rem; font-weight: 600;">${reservation.quantity}</div>
        </div>
        <div>
          <div style="color: #64748b;">Total Amount</div>
          <div style="font-size: 1.25rem; font-weight: 600; color: #4f46e5;">
            $${(reservation.product.price * reservation.quantity).toFixed(2)}
          </div>
        </div>
        <div>
          <div style="color: #64748b;">Shipping To</div>
          <div style="font-size: 1.1rem; font-weight: 500;">
            ${reservation.shippingAddress?.street || "Not specified"}<br>
            ${reservation.shippingAddress?.city || ""}, ${reservation.shippingAddress?.state || ""}
          </div>
        </div>
      </div>

      <div style="text-align: center; margin: 2rem 0;">
        <a href="${process.env.CLIENT_URL}/dashboard/orders/${reservation._id}" class="cta-button">
          View Order Details →
        </a>
      </div>

      <div style="border-top: 1px solid #e2e8f0; padding-top: 1.5rem;">
        <h3 style="margin: 0 0 1rem; font-size: 1.125rem;">Next Steps</h3>
        <ol style="margin: 0; padding-left: 1.5rem;">
          <li>Confirm inventory availability</li>
          <li>Prepare order for shipment</li>
          <li>Update shipping status within 24 hours</li>
        </ol>
      </div>
    </div>

    <div class="footer">
      <div class="disclaimer">
        <p>© ${new Date().getFullYear()} FixItHub Pro Network<br>
        123 Commerce Street, Tech Valley | 
        <a href="https://fixithub.com/terms" style="color: #4f46e5;">Service Terms</a> | 
        <a href="https://fixithub.com/privacy" style="color: #4f46e5;">Privacy Policy</a></p>
        <p style="margin-top: 1rem;">Need assistance? Contact support: 📞 <a href="tel:+1234567890" style="color: #4f46e5;">+1 (234) 567-890</a></p>
      </div>
    </div>
  </div>
</body>
</html>
`;

export const warningEmailTemplate = (username, reason) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>⚠️ Content Policy Warning - FixItHub</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
    body {
      margin: 0;
      padding: 0;
      background: #f8fafc;
      font-family: 'Inter', Arial, sans-serif;
    }
    .container {
      max-width: 680px;
      margin: 2rem auto;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 4px 24px rgba(99, 102, 241, 0.08);
    }
    .header {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      padding: 2.5rem;
      border-radius: 16px 16px 0 0;
      text-align: center;
    }
    .brand {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      color: white;
      font-size: 1.875rem;
      font-weight: 700;
    }
    .alert-box {
      background: #fef2f2;
      border-left: 4px solid #dc2626;
      padding: 1.5rem;
      border-radius: 8px;
      margin: 2rem 0;
    }
    .footer {
      background: #f1f5f9;
      padding: 1.5rem;
      text-align: center;
      border-radius: 0 0 16px 16px;
    }
    .disclaimer {
      font-size: 0.75rem;
      color: #64748b;
      line-height: 1.5;
      max-width: 560px;
      margin: 0 auto;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0L0 16L16 32L32 16L16 0Z" fill="white"/>
          <path d="M16 8L8 16L16 24L24 16L16 8Z" fill="#DC2626"/>
        </svg>
        FixItHub Safety
      </div>
    </div>

    <div style="padding: 2.5rem;">
      <div class="alert-box">
        <h2 style="margin: 0 0 1rem; font-size: 1.5rem; color: #7f1d1d;">
          ⚠️ Content Policy Violation
        </h2>
        <p style="margin: 0.5rem 0; color: #1e293b;">
          Hello ${username},<br>
          Your account has received a community guideline violation:
        </p>
        <div style="background: #fee2e2; padding: 1rem; border-radius: 8px; margin: 1.5rem 0;">
          <p style="margin: 0; color: #991b1b; font-weight: 500;">
            ${reason || "Violation of community standards"}
          </p>
        </div>
      </div>

      <div style="margin: 2rem 0;">
        <h3 style="margin: 0 0 1rem; font-size: 1.25rem;">Required Actions</h3>
        <ol style="margin: 0; padding-left: 1.5rem;">
          <li>Review our <a href="${process.env.BASE_URL}/policies" style="color: #4f46e5; text-decoration: none;">Content Policies</a></li>
          <li>Remove or edit violating content</li>
          <li>Appeal within 7 days if you believe this is an error</li>
        </ol>
      </div>

      <div style="border-top: 1px solid #e2e8f0; padding-top: 1.5rem;">
        <h3 style="margin: 0 0 1rem; font-size: 1.125rem;">Consequences</h3>
        <ul style="margin: 0; padding-left: 1.5rem;">
          <li>Content temporarily hidden</li>
          <li>Repeated violations may lead to account suspension</li>
          <li>Potential loss of professional status</li>
        </ul>
      </div>
    </div>

    <div class="footer">
      <div class="disclaimer">
        <p>© ${new Date().getFullYear()} FixItHub Trust & Safety<br>
        123 Compliance Lane, Tech Valley | 
        <a href="https://fixithub.com/terms" style="color: #4f46e5;">Community Guidelines</a> | 
        <a href="https://fixithub.com/privacy" style="color: #4f46e5;">Privacy Policy</a></p>
        <p style="margin-top: 1rem;">This is an automated notification - appeals must be submitted through our <a href="${process.env.BASE_URL}/appeals" style="color: #4f46e5;">appeals portal</a></p>
      </div>
    </div>
  </div>
</body>
</html>
`;

export const banEmailTemplate = (username, reason) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🚫 Account Suspended - FixItHub</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
    body {
      margin: 0;
      padding: 0;
      background: #f8fafc;
      font-family: 'Inter', Arial, sans-serif;
    }
    .container {
      max-width: 680px;
      margin: 2rem auto;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 4px 24px rgba(99, 102, 241, 0.08);
    }
    .header {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      padding: 2.5rem;
      border-radius: 16px 16px 0 0;
      text-align: center;
    }
    .brand {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      color: white;
      font-size: 1.875rem;
      font-weight: 700;
    }
    .alert-box {
      background: #fef2f2;
      border-left: 4px solid #dc2626;
      padding: 1.5rem;
      border-radius: 8px;
      margin: 2rem 0;
    }
    .footer {
      background: #f1f5f9;
      padding: 1.5rem;
      text-align: center;
      border-radius: 0 0 16px 16px;
    }
    .disclaimer {
      font-size: 0.75rem;
      color: #64748b;
      line-height: 1.5;
      max-width: 560px;
      margin: 0 auto;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0L0 16L16 32L32 16L16 0Z" fill="white"/>
          <path d="M16 8L8 16L16 24L24 16L16 8Z" fill="#DC2626"/>
        </svg>
        FixItHub Safety
      </div>
    </div>

    <div style="padding: 2.5rem;">
      <div class="alert-box">
        <h2 style="margin: 0 0 1rem; font-size: 1.5rem; color: #7f1d1d;">
          🚫 Account Suspension Notice
        </h2>
        <p style="margin: 0.5rem 0; color: #1e293b;">
          Hello ${username},<br>
          Your account has been permanently suspended due to:
        </p>
        <div style="background: #fee2e2; padding: 1rem; border-radius: 8px; margin: 1.5rem 0;">
          <p style="margin: 0; color: #991b1b; font-weight: 500;">
            ${reason || "Severe or repeated policy violations"}
          </p>
        </div>
      </div>

      <div style="margin: 2rem 0;">
        <h3 style="margin: 0 0 1rem; font-size: 1.25rem;">Immediate Restrictions</h3>
        <ul style="margin: 0; padding-left: 1.5rem;">
          <li>All account access revoked</li>
          <li>Active services/listings terminated</li>
          <li>Pending transactions canceled</li>
          <li>Funds held for 45 days pending review</li>
        </ul>
      </div>

      <div style="border-top: 1px solid #e2e8f0; padding-top: 1.5rem;">
        <h3 style="margin: 0 0 1rem; font-size: 1.125rem;">Appeal Process</h3>
        <ol style="margin: 0; padding-left: 1.5rem;">
          <li>Submit appeal request within 30 days</li>
          <li>Email <a href="mailto:appeals@fixithub.com" style="color: #4f46e5;">appeals@fixithub.com</a> with:
            <ul style="margin: 0.5rem 0; padding-left: 1.5rem;">
              <li>Full name and account email</li>
              <li>Detailed appeal explanation</li>
              <li>Supporting evidence</li>
            </ul>
          </li>
          <li>Await response within 14 business days</li>
        </ol>
      </div>
    </div>

    <div class="footer">
      <div class="disclaimer">
        <p>© ${new Date().getFullYear()} FixItHub Trust & Safety<br>
        123 Compliance Lane, Tech Valley | 
        <a href="https://fixithub.com/terms" style="color: #4f46e5;">Terms of Service</a> | 
        <a href="https://fixithub.com/privacy" style="color: #4f46e5;">Privacy Policy</a></p>
        <p style="margin-top: 1rem;">This action is taken in accordance with Section 8.2 of our Terms of Service</p>
      </div>
    </div>
  </div>
</body>
</html>
`;
