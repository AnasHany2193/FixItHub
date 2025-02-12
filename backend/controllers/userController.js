import User from "../models/User.js";
import createHttpError from "http-errors";

/**
 * @desc    Get authenticated user's profile
 * @access  Private (All roles)
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
 * @desc    Update authenticated user's profile
 * @access  Private (All roles)
 * @note    Email changes should trigger verification
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
 * @desc    Get public profile by ID
 * @access  Public
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
 * @desc    Get paginated list of approved workers
 * @access  Public
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
 * @desc    Get paginated list of customers (Admin only)
 * @access  Private (Admin)
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
