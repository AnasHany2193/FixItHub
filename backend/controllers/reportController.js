import createHttpError from "http-errors";
import Report from "../models/Report.js";

export const createReport = async (req, res, next) => {
  try {
    const report = await Report.create({
      reporter: req.user._id,
      ...req.body,
    });

    res.status(201).json({
      success: true,
      message: "Report submitted successfully 🚨",
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

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
