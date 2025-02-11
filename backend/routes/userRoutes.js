import express from "express";

import { protect } from "../middlewares/authMiddleware.js";
import {
  getMyProfile,
  updateMyProfile,
  getAllWorkers,
  getAllCustomers,
  getUserProfile,
} from "../controllers/userController.js";

const router = express.Router();

/**
 * @desc    Get current user profile
 * @route   GET /api/v1/users/me
 * @access  Private
 */
router.get("/me", protect, getMyProfile);

/**
 * @desc    Update current user profile
 * @route   PATCH /api/v1/users/me
 * @access  Private
 */
router.patch("/me", protect, updateMyProfile);

// Public User Access
/**
 * @desc    Get public user profile
 * @route   GET /api/v1/users/:id
 * @access  Public
 */
router.get("/:id", protect, getUserProfile);

/**
 * @desc    Get all service workers
 * @route   GET /api/v1/users/workers
 * @access  Public
 */
router.get("/workers", protect, getAllWorkers);

/**
 * @desc    Get all customers
 * @route   GET /api/v1/users/customers
 * @access  Public
 */
router.get("/customers", protect, getAllCustomers);

export default router;
