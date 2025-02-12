import createHttpError from "http-errors";
import Report from "../models/Report.js";

// ===================================================
//                 REPORT SUBMISSION
// ===================================================

/**
 * @desc    Create new report
 * @route   POST /api/v1/reports
 * @access  Private (All users)
 * @note    Reports can target various content types
 */
export const createReport = async (req, res, next) => {
  try {
    const report = await Report.create({
      reporter: req.user._id,
      ...req.body,
    });

    // 📧 Should send report confirmation to user
    // 📧 Should send admin notification

    res.status(201).json({
      success: true,
      message: "Report submitted successfully 🚨",
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

// ===================================================
//                 REPORT QUERIES
// ===================================================

/**
 * @desc    Get user's submitted reports
 * @route   GET /api/v1/reports
 * @access  Private (Report Owner)
 */
export const getUserReports = async (req, res, next) => {
  try {
    const reports = await Report.find({ reporter: req.user._id })
      .sort("-createdAt")
      .populate("contentId", "title username");

    res.json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get report details
 * @route   GET /api/v1/reports/:id
 * @access  Private (Report Owner)
 */
export const getReportDetails = async (req, res, next) => {
  try {
    const report = await Report.findOne({
      _id: req.params.id,
      reporter: req.user._id,
    }).populate("contentId", "title username");

    if (!report) return next(createHttpError(404, "Report not found"));

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};
