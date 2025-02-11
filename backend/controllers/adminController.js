import mongoose from "mongoose";
import createHttpError from "http-errors";

import User from "../models/User.js";
import { sendApprovalEmail } from "../services/emailService.js";

export const listUsers = async (req, res, next) => {
  try {
    const { role, status, search, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { username: new RegExp(search, "i") },
        { email: new RegExp(search, "i") },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password -tokenVersion")
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: users,
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

export const updateUserStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { status, reason } = req.body;
    const validStatuses = ["active", "suspended", "banned"];

    if (!validStatuses.includes(status))
      return next(createHttpError(400, "Invalid user status"));

    const user = await User.findByIdAndUpdate(
      userId,
      { status },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) return next(createHttpError(404, "User not found"));

    // Log admin action
    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        adminLogs: {
          action: "STATUS_UPDATE",
          targetUser: userId,
          details: {
            previousStatus: user.status,
            newStatus: status,
            reason,
          },
        },
      },
    });

    res.json({
      success: true,
      message: `User status updated to ${status}`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

//
export const getWorkerApplications = async (req, res, next) => {
  try {
    const applications = await User.find({
      "workerApplication.status": "pending",
    }).select("username email workerApplication");

    res.status(200).json({ success: true, data: applications });
  } catch (err) {
    next(err);
  }
};

//
export const updateWorkerStatus = async (req, res, next) => {
  const { userId } = req.params;
  const { status } = req.body;
  try {
    if (!mongoose.isValidObjectId(userId))
      throw createHttpError(404, "Invalid User ID");

    const user = await User.findById(userId);
    if (!user || user.role !== "customer") {
      throw createHttpError(404, "Worker application not found");
    }

    user.workerApplication.status = status;
    if (status === "approved") {
      user.role = "worker";

      // Send approval email
      sendApprovalEmail(user.email, user.username);
    }

    await user.save();
    res.status(200).json({ success: true, message: `Application ${status}` });
  } catch (err) {
    next(err);
  }
};
