import createHttpError from "http-errors";

import User from "../models/User.js";

import Bid from "../models/Bid.js";
import Offer from "../models/Offer.js";
import Auction from "../models/Auction.js";
import RepairRequest, { RepairStatus } from "../models/RepairRequest.js";

import Order from "../models/Order.js";
import Review from "../models/Review.js";
import Product from "../models/Product.js";

// [GET] /admin/users?role=worker
export const getUsersByRole = async (req, res, next) => {
  const { role } = req.query;

  try {
    const validRoles = ["customer", "worker"];
    const filter = validRoles.includes(role)
      ? { role }
      : { role: { $in: validRoles } }; // Excludes admin

    const users = await User.find(filter);

    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

// [GET] /admin/users/:id
export const getUserDetails = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return next(createHttpError(404, "User not found"));

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// [PATCH] /admin/users/:id/status
export const updateUserStatus = async (req, res, next) => {
  const { status } = req.body;
  if (!["active", "banned"].includes(status))
    return next(createHttpError(400, "Invalid status"));

  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(createHttpError(404, "User not found"));

    user.status = status;
    if (status === "banned") user.bannedAt = new Date();
    else user.bannedAt = null;

    // Log the admin action
    user.adminLogs.push({
      action: "Update Status",
      targetUser: user._id,
      details: { status },
    });

    await user.save();

    res.json({ success: true, message: `User ${status}` });
  } catch (err) {
    next(err);
  }
};

// [PATCH] /admin/users/:id/worker-approval
export const approveOrRejectWorker = async (req, res, next) => {
  const { status } = req.body;
  if (!["approved", "rejected"].includes(status))
    return next(createHttpError(400, "Invalid approval status"));

  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== "worker")
      return next(createHttpError(404, "Worker not found"));

    user.workerApplication.status = status;

    // Log the admin action
    user.adminLogs.push({
      action: "Worker Approval",
      targetUser: user._id,
      details: { newStatus: status },
    });

    await user.save();

    res.json({ success: true, message: `Worker ${status}` });
  } catch (err) {
    next(err);
  }
};

// [GET] /admin/logs
export const getAdminLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 5, action, startDate, endDate } = req.query;
    const skip = (page - 1) * limit;

    const matchStage = {};
    if (action && action !== "all") matchStage["adminLogs.action"] = action;
    if (startDate || endDate) {
      matchStage["adminLogs.timestamp"] = {};
      if (startDate)
        matchStage["adminLogs.timestamp"].$gte = new Date(startDate);
      if (endDate) matchStage["adminLogs.timestamp"].$lte = new Date(endDate);
    }
    const pipeline = [
      { $match: { "adminLogs.0": { $exists: true } } },
      { $unwind: "$adminLogs" },
      { $match: matchStage },
      { $sort: { "adminLogs.timestamp": -1 } },
      {
        $facet: {
          logs: [
            { $skip: skip },
            { $limit: Number(limit) },
            {
              $project: {
                _id: 0,
                id: "$adminLogs._id",
                action: "$adminLogs.action",
                adminUser: {
                  _id: "$_id",
                  username: "$username",
                },
                targetUser: "$adminLogs.targetUser",
                details: "$adminLogs.details",
                timestamp: "$adminLogs.timestamp",
              },
            },
          ],
          totalCount: [{ $count: "count" }],
        },
      },
    ];

    const result = await User.aggregate(pipeline);
    const logs = result[0].logs;
    const totalCount = result[0].totalCount[0]?.count || 0;

    res.json({
      success: true,
      data: logs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

// Helper to log admin actions
const logAdminAction = async (adminId, action, targetUserId, details) => {
  await User.findByIdAndUpdate(adminId, {
    $push: {
      adminLogs: { action, targetUser: targetUserId, details },
    },
  });
};

// [GET] /admin/repairs?auction=true|false
export const getAllRepairs = async (req, res, next) => {
  try {
    const { auction, status, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (auction === "true") filter.auction = { $ne: null };
    if (auction === "false") filter.auction = null;
    if (status && status !== "all") filter.status = status;

    const skip = (page - 1) * limit;

    const [repairs, total] = await Promise.all([
      RepairRequest.find(filter)
        .populate("customer", "username email")
        .populate("worker", "username")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      RepairRequest.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: repairs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

// [GET] /admin/repairs/:id
export const getRepairDetails = async (req, res, next) => {
  try {
    const repair = await RepairRequest.findById(req.params.id)
      .populate("customer", "username email")
      .populate("worker", "username")
      .populate({
        path: "offers",
        populate: { path: "worker", select: "username" },
      })
      .populate({
        path: "auction",
        populate: {
          path: "bids currentLowestBid",
          populate: { path: "worker", select: "username" },
        },
      });

    if (!repair) return next(createHttpError(404, "Repair not found"));

    res.json({ success: true, data: repair });
  } catch (err) {
    next(err);
  }
};

// [PATCH] /admin/repairs/:id/reset-auction
export const resetAuction = async (req, res, next) => {
  const { id } = req.params;
  const adminId = req.user._id;

  try {
    const repair = await RepairRequest.findById(id).populate("auction");
    if (!repair || !repair.auction) {
      return next(createHttpError(404, "Auction not found"));
    }

    const auction = await Auction.findById(repair.auction._id);
    await Bid.deleteMany({ auction: auction._id });

    auction.bids = [];
    auction.currentLowestBid = null;
    auction.expiresAt = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // +2 days
    await auction.save();

    await logAdminAction(adminId, "Reset Auction", repair.customer, {
      repairId: repair._id,
    });

    res.json({ success: true, message: "Auction reset successfully" });
  } catch (err) {
    next(err);
  }
};

// [DELETE] /admin/repairs/:id
export const deleteRepair = async (req, res, next) => {
  const { id } = req.params;
  const adminId = req.user._id;

  try {
    const repair = await RepairRequest.findById(id);
    if (!repair) return next(createHttpError(404, "Repair not found"));

    await Bid.deleteMany({ auction: repair.auction });
    await Offer.deleteMany({ repairRequest: repair._id });
    await Auction.findByIdAndDelete(repair.auction);

    await logAdminAction(adminId, "Deleted Repair", repair.customer, {
      repairId: id,
    });

    await repair.deleteOne();

    res.json({ success: true, message: "Repair deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// [PATCH] /admin/repairs/:id/cancel
export const cancelRepair = async (req, res, next) => {
  const { id } = req.params;
  const adminId = req.user._id;

  try {
    const repair = await RepairRequest.findById(id);
    if (!repair) return next(createHttpError(404, "Repair not found"));

    repair.status = RepairStatus.CANCELLED;
    await repair.save();

    await logAdminAction(adminId, "Cancelled Repair", repair.customer, {
      repairId: id,
    });

    res.json({ success: true, message: "Repair cancelled successfully" });
  } catch (err) {
    next(err);
  }
};

// [PATCH] /admin/repairs/:id/close-auction
export const closeAuction = async (req, res, next) => {
  const { id } = req.params;
  const adminId = req.user._id;

  try {
    const repair = await RepairRequest.findById(id);
    if (!repair || !repair.auction) {
      return next(createHttpError(404, "Auction not found"));
    }

    repair.status = RepairStatus.AWAITING_ASSIGNMENT;
    await repair.save();

    await Auction.findByIdAndUpdate(repair.auction, { status: "closed" });

    await logAdminAction(adminId, "Closed Auction", repair.customer, {
      repairId: id,
    });

    res.json({ success: true, message: "Auction closed and status updated" });
  } catch (err) {
    next(err);
  }
};

export const getAllProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, category, search } = req.query;
    const filter = {};

    if (category && category !== "all") filter.category = category;
    if (search) filter.name = { $regex: search, $options: "i" };

    const products = await Product.find(filter)
      .populate("seller")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(filter);

    res.json({ success: true, data: products, total });
  } catch (err) {
    next(err);
  }
};

export const getProductDetails = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate("seller");
    if (!product) return next(createHttpError(404, "Product not found"));

    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return next(createHttpError(404, "Product not found"));

    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        adminLogs: {
          action: "Delete Product",
          targetUser: product.seller,
          details: { productId: product._id, name: product.name },
        },
      },
    });

    res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    next(err);
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const filter = {};

    if (status && status !== "all") filter.status = status;

    const orders = await Order.find(filter)
      .populate("user items.product")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments(filter);

    res.json({ success: true, data: orders, total });
  } catch (err) {
    next(err);
  }
};

export const deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return next(createHttpError(404, "Order not found"));

    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        adminLogs: {
          action: "Delete Order",
          targetUser: order.user,
          details: { orderId: order._id, total: order.total },
        },
      },
    });

    res.json({ success: true, message: "Order deleted" });
  } catch (err) {
    next(err);
  }
};

export const getAllReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sortByRating = "desc" } = req.query;
    const sortDirection = sortByRating === "asc" ? 1 : -1;

    const reviews = await Review.find()
      .populate("user", "username")
      .populate("product", "name")
      .sort({ rating: sortDirection, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Review.countDocuments();

    res.json({ success: true, data: reviews, total });
  } catch (err) {
    next(err);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return next(createHttpError(404, "Review not found"));

    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        adminLogs: {
          action: "Delete Review",
          targetUser: review.user,
          details: {
            reviewId: review._id,
            productId: review.product,
            rating: review.rating,
          },
        },
      },
    });

    res.json({ success: true, message: "Review deleted" });
  } catch (err) {
    next(err);
  }
};
