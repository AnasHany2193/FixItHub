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

export const getUserDetails = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId)
      .select("-password -tokenVersion")
      .populate({
        path: "workerApplication.documents",
        select: "url public_id",
      })
      .populate({
        path: "adminLogs.targetUser",
        select: "username",
      })
      .lean();

    if (!user) return next(createHttpError(404, "User not found"));

    // Get user reports
    const reports = await Report.find({
      contentType: "user",
      contentId: user._id,
    }).sort("-createdAt");

    const userData = {
      ...user,
      reports,
      activity: {
        productListings: await Product.countDocuments({ worker: user._id }),
        repairsCompleted: user.stats?.completedRepairs || 0,
        lastLogin: user.lastLogin,
      },
    };

    res.json({
      success: true,
      data: userData,
    });
  } catch (error) {
    next(error);
  }
};

export const getWorkerApplications = async (req, res, next) => {
  try {
    const { status = "pending", page = 1, limit = 10 } = req.query;

    const [applications, total] = await Promise.all([
      User.find({
        "workerApplication.status": status,
        role: "worker",
      })
        .select("username email profile workerApplication createdAt")
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),

      User.countDocuments({
        "workerApplication.status": status,
        role: "worker",
      }),
    ]);

    res.json({
      success: true,
      data: applications,
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

export const processApplication = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { status, reason } = req.body;

    const validStatuses = ["approved", "rejected"];
    if (!validStatuses.includes(status))
      return next(createHttpError(400, "Invalid application status"));

    const user = await User.findByIdAndUpdate(
      userId,
      { "workerApplication.status": status },
      { new: true }
    ).select("email username workerApplication");

    if (!user) return next(createHttpError(404, "User not found"));

    // Send email notification
    await sendApprovalEmail(user.email, user.username, status, reason);

    // Clean up rejected documents
    if (status === "rejected" && user.workerApplication.documents?.length) {
      const publicIds = user.workerApplication.documents
        .map((doc) => doc.public_id)
        .filter(Boolean);

      if (publicIds.length) await cloudinary.api.delete_resources(publicIds);
    }

    res.json({
      success: true,
      message: `Application ${status} successfully`,
      data: {
        userId,
        newStatus: status,
        emailSent: true,
      },
    });
  } catch (error) {
    next(error);
  }
};
