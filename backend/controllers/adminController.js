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
