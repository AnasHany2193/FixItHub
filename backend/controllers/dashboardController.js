import createHttpError from "http-errors";

import User from "../models/User.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import RepairRequest from "../models/RepairRequest.js";

export const CustomerDashboardController = {
  getDashboardSummary: async (req, res, next) => {
    try {
      const userId = req.user._id;

      const [repairs, orders, favorites] = await Promise.all([
        RepairRequest.aggregate([
          {
            $match: {
              customer: userId,
              status: { $nin: ["completed", "cancelled"] },
            },
          },
          { $sort: { createdAt: -1 } },
          { $limit: 3 },
          {
            $project: {
              _id: 1,
              title: 1,
              status: 1,
              createdAt: 1,
              auction: 1,
              worker: 1,
            },
          },
        ]),

        Order.aggregate([
          { $match: { user: userId } },
          { $sort: { createdAt: -1 } },
          { $limit: 3 },
          {
            $project: {
              _id: 1,
              total: 1,
              status: 1,
              createdAt: 1,
              items: { $slice: ["$items", 2] },
            },
          },
        ]),

        Product.aggregate([
          { $match: { favoritesCount: { $gt: 0 } } },
          { $sample: { size: 4 } },
          {
            $project: {
              name: 1,
              price: 1,
              images: { $slice: ["$images", 1] },
            },
          },
        ]),
      ]);

      const stats = await User.findById(userId)
        .select("stats completedRepairs completedSales")
        .lean();

      res.status(200).json({
        success: true,
        data: {
          activeRepairs: repairs,
          recentOrders: orders,
          suggestedProducts: favorites,
          repairStats: {
            totalCompleted: stats.completedRepairs,
            totalSpent: stats.completedSales,
          },
        },
      });
    } catch (error) {
      next(createHttpError(500, "Failed to load dashboard data"));
    }
  },
};

export const RepairHistoryController = {
  getRepairHistory: async (req, res, next) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const repairs = await RepairRequest.find({
        customer: req.user._id,
        status: { $in: ["completed", "cancelled"] },
      })
        .sort("-createdAt")
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("worker", "username profile.avatar")
        .lean();

      res.status(200).json({
        success: true,
        count: repairs.length,
        data: repairs,
      });
    } catch (error) {
      next(createHttpError(500, "Failed to fetch repair history"));
    }
  },
};

export const ActiveRepairsController = {
  getActiveRepairs: async (req, res, next) => {
    try {
      const activeRepairs = await RepairRequest.find({
        customer: req.user._id,
        status: { $in: ["in_progress", "awaiting_payment", "auction_open"] },
      })
        .populate({
          path: "auction",
          select: "currentLowestBid expiresAt bids",
          populate: {
            path: "currentLowestBid",
            select: "bidPrice",
          },
        })
        .lean();

      res.status(200).json({
        success: true,
        data: activeRepairs,
      });
    } catch (error) {
      next(createHttpError(500, "Failed to fetch active repairs"));
    }
  },
};

export const MarketplaceActivityController = {
  getMarketplaceActivity: async (req, res, next) => {
    try {
      const { page = 1, limit = 5 } = req.query;
      const activity = await Order.find({ user: req.user._id })
        .sort("-createdAt")
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("items.product", "name price images")
        .lean();

      res.status(200).json({
        success: true,
        data: activity,
      });
    } catch (error) {
      next(createHttpError(500, "Failed to fetch marketplace activity"));
    }
  },

  getFavoriteProducts: async (req, res, next) => {
    try {
      const favorites = await Favorite.find({ user: req.user._id })
        .populate("product", "name price images category")
        .sort("-createdAt")
        .lean();

      res.status(200).json({
        success: true,
        data: favorites.map((f) => f.product),
      });
    } catch (error) {
      next(createHttpError(500, "Failed to fetch favorite products"));
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
