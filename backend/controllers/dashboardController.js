import createHttpError from "http-errors";

import User from "../models/User.js";
import Order from "../models/Order.js";
import Review from "../models/Review.js";
import Product from "../models/Product.js";
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

export const WorkerDashboardController = {
  getWorkerDashboard: async (req, res, next) => {
    try {
      const workerId = req.user._id;

      const [repairStats, productStats, reviewStats, recentActivity] =
        await Promise.all([
          // Repair Analytics
          RepairRequest.aggregate([
            {
              $match: {
                worker: workerId,
                status: "completed",
                paymentStatus: "paid",
              },
            },
            {
              $addFields: {
                firstStep: { $arrayElemAt: ["$trackingUpdates", 0] },
                lastStep: { $arrayElemAt: ["$trackingUpdates", -1] },
              },
            },
            {
              $group: {
                _id: null,
                totalCompleted: { $sum: 1 },
                totalEarnings: { $sum: "$paymentAmount" },
                avgRepairTime: {
                  $avg: {
                    $subtract: ["$lastStep.timestamp", "$firstStep.timestamp"],
                  },
                },
              },
            },
            {
              $project: {
                _id: 0,
                totalCompleted: 1,
                totalEarnings: 1,
                avgRepairTime: {
                  $divide: ["$avgRepairTime", 1000 * 60 * 60], // Convert ms to hours
                },
              },
            },
          ]),

          // Product Analytics
          Product.aggregate([
            { $match: { seller: workerId } },
            {
              $group: {
                _id: null,
                totalProducts: { $sum: 1 },
                totalSold: { $sum: "$purchasesCount" },
                totalRevenue: {
                  $sum: { $multiply: ["$price", "$purchasesCount"] },
                },
                avgRating: { $avg: "$avgRating" },
              },
            },
          ]),

          // Review Analytics
          Review.aggregate([
            {
              $lookup: {
                from: "products",
                localField: "product",
                foreignField: "_id",
                as: "product",
              },
            },
            { $unwind: "$product" },
            { $match: { "product.seller": workerId } },
            {
              $group: {
                _id: null,
                avgRating: { $avg: "$rating" },
                totalReviews: { $sum: 1 },
              },
            },
          ]),

          // Recent Activity
          RepairRequest.find({ worker: workerId })
            .sort("-createdAt")
            .limit(5)
            .select("title status createdAt")
            .lean(),
        ]);

      res.status(200).json({
        success: true,
        data: {
          stats: {
            repairs: repairStats[0] || {
              totalCompleted: 0,
              totalEarnings: 0,
              avgRepairTime: 0,
            },
            products: productStats[0] || {
              totalProducts: 0,
              totalSold: 0,
              totalRevenue: 0,
              avgRating: 0,
            },
            reviews: reviewStats[0] || {
              avgRating: 0,
              totalReviews: 0,
            },
          },
          recentActivity,
          currentStatus: {
            activeRepairs: await RepairRequest.countDocuments({
              worker: workerId,
              status: { $in: ["in_progress", "awaiting_payment"] },
            }),
            pendingOrders: await Order.countDocuments({
              "items.product": {
                $in: await Product.find({ seller: workerId }).distinct("_id"),
              },
              status: "processing",
            }),
          },
        },
      });
    } catch (error) {
      console.log("error", error);
      next(createHttpError(500, "Failed to load worker dashboard data"));
    }
  },
};
