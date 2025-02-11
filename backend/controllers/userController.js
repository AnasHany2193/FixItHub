import User from "../models/User.js";
import createHttpError from "http-errors";

/**
 * @desc    Get current user's profile
 * @route   GET /api/v1/users/me
 * @access  Private
 * @returns {Object} User profile data (excluding sensitive fields)
 */
export const getMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password -tokenVersion")
      .lean();

    if (!user) throw createHttpError.NotFound("User not found");

    res.status(200).json({
      success: true,
      data: user,
      message: "Profile retrieved successfully 👤",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update current user's profile
 * @route   PATCH /api/v1/users/me
 * @access  Private
 * @param   {Object} req.body - Allowed fields: profile.bio, profile.phone,
 *                              profile.address, profile.socialMedia, profile.avatar
 * @returns {Object} Updated user profile
 */
export const updateMyProfile = async (req, res, next) => {
  try {
    // Allowed fields for update (validation handled in model)
    const allowedFields = [
      "profile.bio",
      "profile.phone",
      "profile.address",
      "profile.socialMedia",
      "profile.avatar",
    ];

    // Filter and construct update object
    const updates = Object.keys(req.body)
      .filter((key) => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});

    // Perform update with schema validation
    const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select("-password -tokenVersion");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully ✨",
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get public profile of any user
 * @route   GET /api/v1/users/:id
 * @access  Public
 * @param   {string} req.params.id - User ID
 * @returns {Object} Public user data (role-specific filtering)
 */
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select("username role profile.avatar rating workerApplication.skills")
      .lean();

    if (!user) throw createHttpError.NotFound("User not found");

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all approved service workers with filters
 * @route   GET /api/v1/users/workers
 * @access  Public
 * @param   {string} [req.query.skills] - Comma-separated list of skills
 * @param   {number} [req.query.minRating] - Minimum rating (0-5)
 * @param   {string} [req.query.availability] - Availability status
 * @param   {number} [req.query.page=1] - Pagination page
 * @param   {number} [req.query.limit=10] - Items per page
 * @returns {Object} Paginated list of workers
 */
export const getAllWorkers = async (req, res, next) => {
  try {
    const { skills, minRating, availability, page = 1, limit = 10 } = req.query;

    // Build filter from query parameters
    const filter = {
      role: "worker",
      "workerApplication.status": "approved",
      ...(minRating && { "rating.average": { $gte: Number(minRating) } }),
    };

    if (skills) filter["workerApplication.skills"] = { $in: skills.split(",") };
    if (availability) filter["workerApplication.availability"] = availability;

    // Parallel execution for performance
    const [workers, total] = await Promise.all([
      User.find(filter)
        .select("username profile.avatar rating workerApplication")
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean(),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      message: `Found ${workers.length} workers matching your criteria 🔍`,
      data: workers,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all customer accounts with location filter
 * @route   GET /api/v1/users/customers
 * @access  Public
 * @param   {string} [req.query.city] - Filter by city (case-insensitive)
 * @param   {number} [req.query.page=1] - Pagination page
 * @param   {number} [req.query.limit=10] - Items per page
 * @returns {Object} Paginated list of customers
 */
export const getAllCustomers = async (req, res, next) => {
  try {
    const { city, page = 1, limit = 10 } = req.query;
    const filter = { role: "customer" };

    if (city) filter["profile.address.city"] = new RegExp(city, "i");

    const [customers, total] = await Promise.all([
      User.find(filter)
        .select("username profile createdAt lastLogin")
        .sort("-createdAt")
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean(),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: customers,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};
