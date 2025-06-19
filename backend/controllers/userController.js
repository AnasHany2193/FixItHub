import User from "../models/User.js";
import createHttpError from "http-errors";
import validator from "validator";

/**
 * @desc    Get authenticated user's profile
 * @access  Private (All roles)
 */
export const getMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select("+password")
      .populate("adminLogs.targetUser", "username");
    if (!user) return next(createHttpError(404, "User not found"));

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
    const { _id: userId, role } = req.user;
    const updates = req.body;

    // Define fields that can be updated by role
    const allowedFields = {
      common: [
        "username",
        "email",
        "password",
        "profile.avatar.url",
        "profile.avatar.public_id",
        "profile.phone",
        "profile.bio",
        "profile.address.street",
        "profile.address.city",
        "profile.address.state",
        "profile.address.zip",
        "profile.address.country",
        "profile.socialMedia.website",
        "profile.socialMedia.linkedin",
        "profile.socialMedia.twitter",
      ],
      worker: [
        "workerApplication.skills",
        "workerApplication.certifications",
        "workerApplication.experience",
        "workerApplication.documents",
        "workerApplication.workHistory",
        "workerApplication.availability",
      ],
      admin: [], // Admins can update common fields only
    };

    // Combine allowed fields based on role
    const permittedFields = [
      ...allowedFields.common,
      ...(allowedFields[role] || []),
    ];

    // Filter updates to only allowed fields
    const filteredUpdates = {};
    for (const key of Object.keys(updates)) {
      if (permittedFields.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    }

    // Validate specific fields
    if (filteredUpdates.email && !validator.isEmail(filteredUpdates.email)) {
      return next(createHttpError(400, "Invalid email"));
    }
    if (
      filteredUpdates["profile.phone"] &&
      !validator.isMobilePhone(filteredUpdates["profile.phone"])
    ) {
      return next(createHttpError(400, "Invalid phone number"));
    }
    if (
      filteredUpdates["profile.address.zip"] &&
      !validator.isPostalCode(filteredUpdates["profile.address.zip"])
    ) {
      return next(createHttpError(400, "Invalid ZIP code"));
    }
    if (
      filteredUpdates["profile.socialMedia.website"] &&
      !validator.isURL(filteredUpdates["profile.socialMedia.website"])
    ) {
      return next(createHttpError(400, "Invalid website URL"));
    }
    if (
      filteredUpdates["profile.socialMedia.linkedin"] &&
      !validator.isURL(filteredUpdates["profile.socialMedia.linkedin"])
    ) {
      return next(createHttpError(400, "Invalid LinkedIn URL"));
    }
    if (
      filteredUpdates["profile.socialMedia.twitter"] &&
      !validator.isURL(filteredUpdates["profile.socialMedia.twitter"])
    ) {
      return next(createHttpError(400, "Invalid Twitter URL"));
    }
    // Validate avatar URL
    if (filteredUpdates["profile.avatar.url"]) {
      if (!validator.isURL(filteredUpdates["profile.avatar.url"])) {
        return next(createHttpError(400, "Invalid avatar URL"));
      }
      // If public_id is provided, ensure it's a non-empty string
      if (
        filteredUpdates["profile.avatar.public_id"] &&
        typeof filteredUpdates["profile.avatar.public_id"] !== "string"
      ) {
        return next(createHttpError(400, "Invalid avatar public_id"));
      }
      // If using a local upload URL, ensure public_id is provided
      if (
        filteredUpdates["profile.avatar.url"].startsWith(
          `${process.env.BASE_URL || "http://localhost:5000"}/uploads`
        ) &&
        !filteredUpdates["profile.avatar.public_id"]
      ) {
        return next(
          createHttpError(400, "public_id required for local upload avatar")
        );
      }
    }

    // Handle password update
    if (filteredUpdates.password) {
      if (filteredUpdates.password.length < 6) {
        return next(
          createHttpError(400, "Password must be at least 6 characters")
        );
      }
      const salt = await bcrypt.genSalt(12);
      filteredUpdates.password = await bcrypt.hash(
        filteredUpdates.password,
        salt
      );
    }

    // Check for unique constraints
    if (filteredUpdates.username) {
      const existingUser = await User.findOne({
        username: filteredUpdates.username,
        _id: { $ne: userId },
      });
      if (existingUser)
        return next(createHttpError(400, "Username already taken"));
    }
    if (filteredUpdates.email) {
      const existingUser = await User.findOne({
        email: filteredUpdates.email,
        _id: { $ne: userId },
      });
      if (existingUser)
        return next(createHttpError(400, "Email already taken"));
    }
    if (filteredUpdates["profile.phone"]) {
      const existingUser = await User.findOne({
        "profile.phone": filteredUpdates["profile.phone"],
        _id: { $ne: userId },
      });
      if (existingUser)
        return next(createHttpError(400, "Phone number already taken"));
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: filteredUpdates },
      { new: true, runValidators: true }
    ).select("+password");

    if (!user) return next(createHttpError(404, "User not found"));

    res.status(200).json({
      success: true,
      message: "Profile updated successfully ✨",
      data: user,
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
    const user = await User.findById(req.user._id)
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
