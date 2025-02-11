import express from "express";

// Controllers
import {
  register,
  verifyOTP,
  login,
  logout,
  resendOTP,
  refreshToken,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";

// Middlewares
import { protect } from "../middlewares/authMiddleware.js";
import {
  authLimiter,
  generalLimiter,
  passwordResetLimiter,
} from "../middlewares/rateLimiter.js";

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and authorization management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 65f1a7d8c4b6e12a34b7a9d1
 *         username:
 *           type: string
 *           example: fixitmaster
 *         email:
 *           type: string
 *           example: user@fixithub.com
 *         role:
 *           type: string
 *           enum: [customer, worker, admin]
 *           example: customer
 *         isVerified:
 *           type: boolean
 *           example: true
 *
 *     OTP:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *           format: mongoId
 *           example: 65f1a7d8c4b6e12a34b7a9d1
 *         code:
 *           type: string
 *           description: Hashed OTP code
 *           example: "$2a$10$xyz123..."
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           example: "2024-03-15T12:00:00Z"
 *         type:
 *           type: string
 *           enum: [verification, passwordReset]
 *           example: verification
 *
 *     Error:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: Error description
 */

const router = express.Router();

// Apply general limiter to all auth routes
router.use(generalLimiter);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - role
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 example: fixitpro
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@fixithub.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: "SecurePass123!"
 *               role:
 *                 type: string
 *                 enum: [customer, worker]
 *                 example: customer
 *               skills:
 *                 type: array
 *                 items: string
 *                 example: [plumbing, electrical]
 *               experience:
 *                 type: string
 *                 example: 5 years of experience
 *               documents:
 *                 type: array
 *                 items: string
 *                 example: ["cloudinary.com/doc1", "cloudinary.com/doc2"]
 *     responses:
 *       201:
 *         description: Registration successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Registration successful. Check email for OTP verification.
 *       409:
 *         description: Conflict - User already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/register", authLimiter, register);

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verify OTP code
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@fixithub.com
 *               code:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 6
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Email verified
 *       400:
 *         description: Invalid OTP (expired or mismatch)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/verify-otp", authLimiter, verifyOTP);

/**
 * @swagger
 * /auth/resend-otp:
 *   post:
 *     summary: Resend OTP code
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@fixithub.com
 *     responses:
 *       200:
 *         description: New OTP generated and sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: New OTP sent
 *       429:
 *         description: Too many OTP requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/resend-otp", authLimiter, resendOTP);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Authenticate user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@fixithub.com
 *               password:
 *                 type: string
 *                 example: "SecurePass123!"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 message:
 *                   type: string
 *                   example: Welcome to FixItHub!
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/login", authLimiter, login);

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: New access token generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Invalid or expired refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/refresh-token", refreshToken);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Complete password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@fixithub.com
 *               code:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 6
 *                 example: "654321"
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 example: "NewSecurePass123!"
 *     responses:
 *       200:
 *         description: Password updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Password reset successful
 *       400:
 *         description: Invalid OTP type (not passwordReset)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/reset-password", passwordResetLimiter, resetPassword);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Initiate password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@fixithub.com
 *     responses:
 *       200:
 *         description: Password reset OTP sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: OTP sent to email
 *         headers:
 *           Retry-After:
 *             description: Cooldown period in seconds
 *             schema:
 *               type: integer
 *               example: 300
 */
router.post("/forgot-password", passwordResetLimiter, forgotPassword);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Invalidate authentication tokens
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token version incremented and cookies cleared
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Logged out successfully ツ
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: accessToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT
 */
router.post("/logout", protect, logout);

export default router;
