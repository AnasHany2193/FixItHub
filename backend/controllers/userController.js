import createHttpError from "http-errors";

import User from "../models/User.js";

export const getMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password -tokenVersion")
      .lean();

    if (!user) return next(createHttpError(404, "User not found"));

    res.status(200).json({
      success: true,
      message: "Profile retrieved successfully 👤",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllWorkers = async (req, res, next) => {
  try {
    const { skills, minRating, availability, page = 1, limit = 10 } = req.query;
    const filter = {
      role: "worker",
      "workerApplication.status": "approved",
    };

    // Skill filter
    if (skills)
      filter["workerApplication.skills"] = {
        $in: skills.split(",").map((skill) => skill.trim()),
      };

    // Rating filter
    if (minRating) filter["rating.average"] = { $gte: parseFloat(minRating) };

    // Availability filter
    if (availability) filter["workerApplication.availability"] = availability;

    const [workers, total] = await Promise.all([
      User.find(filter)
        .select(
          "username profile avatar rating workerApplication.skills location"
        )
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .lean(),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      message: `Found ${workers.length} workers matching your criteria 🔍`,
      count: total,
      data: workers,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllCustomers = async (req, res, next) => {
  try {
    const { city, page = 1, limit = 10 } = req.query;
    const filter = { role: "customer" };

    if (city) {
      filter["profile.address.city"] = new RegExp(city, "i");
    }

    const [customers, total] = await Promise.all([
      User.find(filter)
        .select("username profile createdAt lastLogin")
        .sort("-createdAt")
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .lean(),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      message: `Found ${customers.length} customers in ${city || "all locations"} 👥`,
      count: total,
      data: customers.map((c) => ({
        username: c.username,
        avatar: c.profile?.avatar,
        location: c.profile?.address?.city,
        memberSince: c.createdAt,
        lastActive: c.lastLogin,
      })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password -tokenVersion -email -workerApplication.documents")
      .lean();

    if (!user) return next(createHttpError(404, "User not found"));

    const publicData =
      user.role === "worker"
        ? {
            username: user.username,
            profile: user.profile,
            rating: user.rating,
            skills: user.workerApplication?.skills || [],
          }
        : {
            username: user.username,
            profile: { avatar: user.profile?.avatar },
          };

    res.status(200).json({
      success: true,
      message: `Public profile for ${user.username} ${
        user.role === "worker" ? "👨🔧" : "👤"
      }`,
      data: publicData,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMyProfile = async (req, res, next) => {
  try {
    const allowedUpdates = {
      profile: {
        bio: { type: String, maxlength: 500 },
        phone: {
          type: String,
        },
        address: {
          street: String,
          city: String,
          state: String,
          zip: String,
          country: String,
        },
        socialMedia: {
          website: String,
          linkedin: String,
          twitter: String,
        },
      },
      avatar: String,
    };

    // Filter valid updates
    const updates = Object.keys(req.body).reduce((acc, key) => {
      if (allowedUpdates[key] || key.startsWith("profile.")) {
        acc[key] = req.body[key];
      }
      return acc;
    }, {});

    // Handle avatar URL processing
    if (updates.avatar) updates.avatar = processAvatarUrl(updates.avatar);

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

// Helper function
const processAvatarUrl = (url) => {
  if (!url.startsWith("http"))
    throw createHttpError(400, "Invalid avatar URL format");

  return {
    url,
    public_id: url.split("/").pop().split(".")[0],
  };
};
