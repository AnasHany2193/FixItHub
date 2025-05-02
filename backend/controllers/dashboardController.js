import createHttpError from "http-errors";

import User from "../models/User.js";
import Order from "../models/Order.js";
import RepairRequest from "../models/RepairRequest.js";

export const CustomerDashboardController = {
  getDashboardSummary: async (req, res, next) => {
    try {
      const userId = req.user._id;

      const [repairStats, marketplaceStats] = await Promise.all([
        // Repair Analytics
        RepairRequest.aggregate([
          {
            $match: {
              customer: userId,
              status: "completed",
              paymentStatus: "paid",
            },
          },
          {
            $group: {
              _id: null,
              totalCompleted: { $sum: 1 },
              totalSpent: { $sum: "$paymentAmount" },
              avgRepairCost: { $avg: "$paymentAmount" },
            },
          },
        ]),

        // Marketplace Analytics
        Order.aggregate([
          {
            $match: {
              user: userId,
              status: "completed",
            },
          },
          {
            $group: {
              _id: null,
              totalOrders: { $sum: 1 },
              totalSpent: { $sum: "$total" },
              avgOrderValue: { $avg: "$total" },
            },
          },
        ]),
      ]);

      res.status(200).json({
        success: true,
        data: {
          stats: {
            repairs: repairStats[0] || {
              totalCompleted: 0,
              totalSpent: 0,
              avgRepairCost: 0,
            },
            marketplace: marketplaceStats[0] || {
              totalOrders: 0,
              totalSpent: 0,
              avgOrderValue: 0,
            },
          },
        },
      });
    } catch (error) {
      next(createHttpError(500, "Failed to load dashboard data"));
    }
  },
};

export const UserController = {
  getProfile: async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id)
        .select("-password -tokenVersion -warnings -adminLogs")
        .lean();

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(createHttpError(500, "Failed to fetch user profile"));
    }
  },

  updateProfile: async (req, res, next) => {
    try {
      const updates = Object.keys(req.body);
      const allowedUpdates = ["username", "profile", "location"];
      const isValidOperation = updates.every((update) =>
        allowedUpdates.includes(update)
      );

      if (!isValidOperation) {
        throw createHttpError(400, "Invalid updates!");
      }

      const user = await User.findByIdAndUpdate(req.user._id, req.body, {
        new: true,
        runValidators: true,
      }).select("-password -tokenVersion");

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(createHttpError(400, error.message));
    }
  },
};
