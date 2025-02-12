import createHttpError from "http-errors";

import cloudinary from "../config/cloudinary.js";
import { sendApprovalEmail } from "../services/emailService.js";
import {
  sendUserWarning,
  banReportedUser,
  handleContentRemoval,
} from "../utils/reportHandlers.js";

import User from "../models/User.js";
import Review from "../models/Review.js";
import Product from "../models/Product.js";
import RepairRequest from "../models/RepairRequest.js";
import Bid from "../models/Bid.js";
import Auction from "../models/Auction.js";

// ===================================================
//                 USER MANAGEMENT
// ===================================================

/**
 * @desc    List users with filters
 * @route   GET /api/v1/admin/users
 * @access  Private (Admin)
 */
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

/**
 * @desc    Update user status
 * @route   PATCH /api/v1/admin/users/:userId/status
 * @access  Private (Admin)
 */
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

    // 📧 Should send status change email to user
    res.json({
      success: true,
      message: `User status updated to ${status}`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get detailed user profile
 * @route   GET /api/v1/admin/users/:userId
 * @access  Private (Admin)
 */
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

// ===================================================
//                 WORKER APPLICATIONS
// ===================================================

/**
 * @desc    Get worker applications
 * @route   GET /api/v1/admin/applications
 * @access  Private (Admin)
 */
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

/**
 * @desc    Process worker application
 * @route   PATCH /api/v1/admin/applications/:userId
 * @access  Private (Admin)
 */
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

    // 📧 Uses sendApprovalEmail (emailService)
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

// ===================================================
//                 REPORT MANAGEMENT
// ===================================================

/**
 * @desc    List reports with filters
 * @route   GET /api/v1/admin/reports
 * @access  Private (Admin)
 */
export const getReports = async (req, res, next) => {
  try {
    const { status, type, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (type) filter.contentType = type;

    const [reports, total] = await Promise.all([
      Report.find(filter)
        .populate("reporter", "username")
        .populate("contentId")
        .sort("-createdAt")
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Report.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: reports,
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
 * @desc    Get detailed report information
 * @route   GET /api/v1/admin/reports/:id
 * @access  Private (Admin)
 */
export const getReportDetails = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate("reporter", "username email")
      .populate("contentId")
      .populate("resolvedBy", "username")
      .lean();

    if (!report) return next(createHttpError(404, "Report not found"));

    // Get related content details
    let contentDetails;
    switch (report.contentType) {
      case "User":
        contentDetails = await User.findById(report.contentId)
          .select("username email status")
          .lean();
        break;
      case "Product":
        contentDetails = await Product.findById(report.contentId)
          .select("title price status")
          .lean();
        break;
      case "Repair":
        contentDetails = await RepairRequest.findById(report.contentId)
          .select("title status")
          .lean();
        break;
      case "Review":
        contentDetails = await Review.findById(report.contentId)
          .select("rating comment status")
          .lean();
        break;
    }

    res.json({
      success: true,
      data: {
        ...report,
        contentDetails,
        history: await ReportHistory.find({ report: report._id }).sort(
          "-createdAt"
        ),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update report status
 * @route   PATCH /api/v1/admin/reports/:id/status
 * @access  Private (Admin)
 */
export const updateReportStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "under_review", "resolved", "dismissed"];

    if (!validStatuses.includes(status))
      return next(createHttpError(400, "Invalid report status"));

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("contentId");

    // Log admin action
    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        adminLogs: {
          action: "REPORT_STATUS_UPDATE",
          targetReport: report._id,
          details: {
            previousStatus: report.status,
            newStatus: status,
          },
        },
      },
    });

    // 📧 Should send status update to reporter
    res.json({
      success: true,
      message: `Report status updated to ${status}`,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Take action on reported content
 * @route   POST /api/v1/admin/reports/:id/actions
 * @access  Private (Admin)
 */
export const takeReportAction = async (req, res, next) => {
  try {
    const { actionType } = req.body;
    const validActions = [
      "remove_content",
      "warn_user",
      "ban_user",
      "no_action",
    ];

    if (!validActions.includes(actionType))
      return next(createHttpError(400, "Invalid report action"));

    const report = await Report.findById(req.params.id)
      .populate("contentId")
      .populate("reporter");

    // Take action based on type
    switch (actionType) {
      case "remove_content":
        await handleContentRemoval(report);
        break;
      case "warn_user":
        await sendUserWarning(report);
        break;
      case "ban_user":
        await banReportedUser(report);
        break;
    }

    // Update report status
    const updatedReport = await Report.findByIdAndUpdate(
      report._id,
      {
        status: "resolved",
        resolvedBy: req.user._id,
        resolvedAt: new Date(),
        $push: { actionsTaken: actionType },
      },
      { new: true }
    );

    // 📧 Uses sendUserWarning/banReportedUser (emailService)
    res.json({
      success: true,
      message: `Action ${actionType} completed`,
      data: updatedReport,
    });
  } catch (error) {
    next(error);
  }
};

// ===================================================
//                 PRODUCT MANAGEMENT
// ===================================================

/**
 * @desc    Get products with filters
 * @route   GET /api/v1/admin/products
 * @access  Private (Admin)
 */
export const getProducts = async (req, res, next) => {
  try {
    const { status, search, category, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title: new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
      ];
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("worker", "username")
        .sort("-createdAt")
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: products,
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
 * @desc    Get product details with extended information
 * @route   GET /api/v1/admin/products/:id
 * @access  Private (Admin)
 */
export const getProductDetails = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("worker", "username email")
      .populate({
        path: "reservations",
        select: "user quantity status createdAt",
        options: { limit: 10, sort: "-createdAt" },
        populate: {
          path: "user",
          select: "username profile.avatar",
        },
      })
      .lean();

    if (!product) {
      return next(createHttpError(404, "Product not found"));
    }

    // Get sales statistics
    const salesStats = await Reservation.aggregate([
      { $match: { product: product._id, status: "completed" } },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$quantity" },
          totalRevenue: { $sum: "$totalPrice" },
        },
      },
    ]);

    // Get review statistics
    const reviewStats = await Review.aggregate([
      { $match: { product: product._id } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    const productDetails = {
      ...product,
      stats: {
        sales: salesStats[0] || { totalSales: 0, totalRevenue: 0 },
        reviews: reviewStats[0] || { averageRating: 0, totalReviews: 0 },
      },
    };

    res.status(200).json({
      success: true,
      data: productDetails,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete product and associated data
 * @route   DELETE /api/v1/admin/products/:id
 * @access  Private (Admin)
 */
export const deleteProduct = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const product = await Product.findById(req.params.id).session(session);

    if (!product) {
      throw createHttpError(404, "Product not found");
    }

    // Delete product images
    if (product.photos?.length) {
      const publicIds = product.photos
        .map((photo) => photo.public_id)
        .filter(Boolean);
      await cloudinary.api.delete_resources(publicIds);
    }

    // Delete product and reservations
    await Promise.all([
      Product.deleteOne({ _id: product._id }).session(session),
      Reservation.deleteMany({ product: product._id }).session(session),
    ]);

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "Product and associated reservations deleted 🗑️",
      data: null,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

// ===================================================
//                 REPAIR MANAGEMENT
// ===================================================

/**
 * @desc    Get repair requests with filters
 * @route   GET /api/v1/admin/repairs
 * @access  Private (Admin)
 */
export const getRepairs = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { title: new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
      ];
    }

    const [repairs, total] = await Promise.all([
      RepairRequest.find(filter)
        .populate("customer worker", "username email")
        .sort("-createdAt")
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      RepairRequest.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: repairs,
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
 * @desc    Get repair request details
 * @route   GET /api/v1/admin/repairs/:id
 * @access  Private (Admin)
 */
export const getRepairDetails = async (req, res, next) => {
  try {
    const repair = await RepairRequest.findById(req.params.id)
      .populate("customer worker", "username email profile")
      .populate({
        path: "auction",
        select: "status currentLowestBid",
      })
      .populate({
        path: "bids",
        select: "worker bidPrice submittedAt",
        options: { sort: "-submittedAt" },
      })
      .lean();

    if (!repair) {
      return next(createHttpError(404, "Repair request not found"));
    }

    // Get payment history
    const payments = await Payment.find({
      repair: repair._id,
    }).select("amount status createdAt");

    // Get time statistics
    const timeStats = await RepairRequest.aggregate([
      { $match: { _id: repair._id } },
      {
        $project: {
          processingTime: {
            $dateDiff: {
              startDate: "$createdAt",
              endDate: "$completedAt",
              unit: "hour",
            },
          },
        },
      },
    ]);

    const repairDetails = {
      ...repair,
      stats: {
        payments: payments.length,
        totalPaid: payments.reduce((sum, p) => sum + p.amount, 0),
        processingTime: timeStats[0]?.processingTime || 0,
      },
    };

    res.status(200).json({
      success: true,
      data: repairDetails,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete repair request and associated data
 * @route   DELETE /api/v1/admin/repairs/:id
 * @access  Private (Admin)
 */
export const deleteRepair = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const repair = await RepairRequest.findById(req.params.id).session(session);

    if (!repair) {
      throw createHttpError(404, "Repair request not found");
    }

    // Delete associated data
    await Promise.all([
      Auction.deleteOne({ repairRequest: repair._id }).session(session),
      Bid.deleteMany({ repairRequest: repair._id }).session(session),
    ]);

    // Delete repair request
    await RepairRequest.deleteOne({ _id: repair._id }).session(session);

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "Repair request and associated data deleted",
      data: null,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

// ===================================================
//                 REVIEW MANAGEMENT
// ===================================================

/**
 * @desc    Delete any review (Admin only)
 * @route   DELETE /api/v1/admin/reviews/:id
 * @access  Private (Admin)
 */
export const adminDeleteReview = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const review = await Review.findById(req.params.id).session(session);

    if (!review) throw createHttpError(404, "Review not found");

    // Delete review and update ratings
    await Review.deleteOne({ _id: review._id }).session(session);
    await session.commitTransaction();

    // Log admin action
    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        adminLogs: {
          action: "REVIEW_DELETION",
          targetReview: review._id,
          details: {
            type: review.kind,
            rating: review.rating,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Review deleted by admin",
      data: null,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

// ===================================================
//                 AUCTION MANAGEMENT
// ===================================================

/**
 * @desc    Get all auctions with filters
 * @route   GET /api/v1/admin/auctions
 * @access  Private (Admin)
 */
export const getAuctions = async (req, res, next) => {
  try {
    const { status, repairStatus, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (repairStatus) {
      filter.repairRequest = await RepairRequest.find({
        status: repairStatus,
      }).distinct("_id");
    }

    const [auctions, total] = await Promise.all([
      Auction.find(filter)
        .populate({
          path: "repairRequest",
          select: "title status",
        })
        .populate({
          path: "currentLowestBid",
          select: "bidPrice worker",
        })
        .sort("-createdAt")
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Auction.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: auctions,
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
 * @desc    Get auction details
 * @route   GET /api/v1/admin/auctions/:id
 * @access  Private (Admin)
 */
export const getAuctionDetails = async (req, res, next) => {
  try {
    const auction = await Auction.findById(req.params.id)
      .populate({
        path: "repairRequest",
        select: "title description status",
      })
      .populate({
        path: "bids",
        select: "worker bidPrice status submittedAt",
        populate: {
          path: "worker",
          select: "username rating",
        },
      })
      .populate("currentLowestBid")
      .lean();

    if (!auction) {
      return next(createHttpError(404, "Auction not found"));
    }

    // Calculate time remaining
    const timeRemaining = auction.expiresAt - Date.now();
    const hoursRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60));

    // Get bid statistics
    const bidStats = await Bid.aggregate([
      { $match: { auction: auction._id } },
      {
        $group: {
          _id: null,
          totalBids: { $sum: 1 },
          averageBid: { $avg: "$bidPrice" },
          lowestBid: { $min: "$bidPrice" },
        },
      },
    ]);

    const auctionDetails = {
      ...auction,
      stats: bidStats[0] || {
        totalBids: 0,
        averageBid: 0,
        lowestBid: 0,
      },
      timeRemaining: hoursRemaining > 0 ? `${hoursRemaining}h` : "Expired",
    };

    res.json({
      success: true,
      data: auctionDetails,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Restart closed auction and delete existing bids
 * @route   POST /api/v1/admin/auctions/:id/restart
 * @access  Private (Admin)
 */
export const restartAuction = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const auction = await Auction.findById(req.params.id).session(session);

    if (!auction) throw createHttpError(404, "Auction not found");

    if (auction.status === "open")
      throw createHttpError(400, "Auction is already active");

    // Delete all existing bids
    await Bid.deleteMany({ auction: auction._id }).session(session);

    // Reset auction state
    const updatedAuction = await Auction.findByIdAndUpdate(
      auction._id,
      {
        status: "open",
        expiresAt: Date.now() + 72 * 60 * 60 * 1000, // 72 hours from now
        $set: { bids: [], currentLowestBid: null },
      },
      { new: true, session }
    );

    await session.commitTransaction();

    res.json({
      success: true,
      message: "Auction restarted with cleared bids",
      data: updatedAuction,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

/**
 * @desc    Delete auction and associated data
 * @route   DELETE /api/v1/admin/auctions/:id
 * @access  Private (Admin)
 */
export const deleteAuction = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const auction = await Auction.findById(req.params.id).session(session);

    if (!auction) {
      throw createHttpError(404, "Auction not found");
    }

    // Delete associated data
    await Promise.all([
      Bid.deleteMany({ auction: auction._id }).session(session),
      RepairRequest.updateOne(
        { _id: auction.repairRequest },
        { $unset: { auction: 1 } }
      ).session(session),
    ]);

    // Delete auction
    await Auction.deleteOne({ _id: auction._id }).session(session);

    await session.commitTransaction();

    res.json({
      success: true,
      message: "Auction and associated data deleted",
      data: null,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};
