import createHttpError from "http-errors";

import Auction from "../models/Auction.js";
import RepairRequest from "../models/RepairRequest.js";

export const createRepairRequest = async (req, res, next) => {
  try {
    const {
      title,
      category,
      issueDescription,
      itemType,
      startingMaxPrice,
      expiresAt,
      imageUrls, // Array of pre-uploaded image URLs
      shippingRequired,
    } = req.body;

    // Validate images
    if (!imageUrls?.length)
      throw createHttpError(400, "At least one image is required");

    // Create repair request
    const repairRequest = await RepairRequest.create({
      customer: req.user._id,
      title,
      category,
      issueDescription,
      itemType,
      photos: imageUrls.map((url) => ({
        url,
        public_id: url.split("/").pop().split(".")[0], // Extract public ID
      })),
      status: "auction_open",
      shippingRequired: shippingRequired || false,
    });

    // Create associated auction
    const auction = await Auction.create({
      repairRequest: repairRequest._id,
      startingMaxPrice,
      expiresAt: new Date(expiresAt),
    });

    res.status(201).json({
      success: true,
      repairRequest,
      auction,
      message: "Repair request created successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getRepairRequests = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = { customer: req.user._id };

    if (status) filter.status = status;

    const requests = await RepairRequest.find(filter)
      .populate({
        path: "bids",
        select: "bidPrice estimatedTimeDays status submittedAt",
        populate: {
          path: "worker",
          select: "username profile.avatar rating.average",
        },
      })
      .sort("-createdAt");

    res.status(200).json({
      success: true,
      count: requests.length,
      message: "Repair requests retrieved successfully",
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

export const updateRepairStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const repairRequest = await RepairRequest.findOneAndUpdate(
      { _id: req.params.id, customer: req.user._id },
      { status },
      { new: true, runValidators: true }
    );

    if (!repairRequest) throw createHttpError(404, "Repair request not found");

    res.status(200).json({
      success: true,
      data: repairRequest,
      message: "Repair status updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const startRepair = async (req, res, next) => {
  try {
    const repairRequest = await RepairRequest.findOne({
      _id: req.params.id,
      worker: req.user._id,
    });

    if (!repairRequest)
      throw createHttpError(404, "Repair request not found or unauthorized");

    if (repairRequest.status !== "auction_open")
      throw createHttpError(
        400,
        "Repair must be in auction_open status to start"
      );

    repairRequest.status = "in_progress";
    repairRequest.trackingUpdates.push({
      status: "diagnosing",
      location: "Workshop",
    });

    await repairRequest.save();

    res.status(200).json({
      success: true,
      message: "Repair started successfully",
      data: repairRequest,
    });
  } catch (error) {
    next(error);
  }
};

export const completeRepair = async (req, res, next) => {
  try {
    const repairRequest = await RepairRequest.findOne({
      _id: req.params.id,
      worker: req.user._id,
      status: "in_progress",
    });

    if (!repairRequest)
      throw createHttpError(404, "Repair not found or not in progress");

    repairRequest.status = "completed";
    repairRequest.trackingUpdates.push({
      status: "quality_check",
      location: "Quality Assurance Department",
    });

    await repairRequest.save();

    res.status(200).json({
      success: true,
      message: "Repair marked as completed",
      data: repairRequest,
    });
  } catch (error) {
    next(error);
  }
};

export const updateShippingStatus = async (req, res, next) => {
  try {
    const { status, location } = req.body;

    const repairRequest = await RepairRequest.findOne({
      _id: req.params.id,
      worker: req.user._id,
      shippingRequired: true,
    });

    if (!repairRequest)
      throw createHttpError(404, "Repair not found or shipping not required");

    if (repairRequest.paymentDetails.status !== "paid")
      throw createHttpError(402, "Payment required before shipping");

    repairRequest.trackingUpdates.push({ status, location });
    await repairRequest.save();

    res.status(200).json({
      success: true,
      message: "Shipping status updated",
      data: repairRequest.trackingUpdates,
    });
  } catch (error) {
    next(error);
  }
};

export const getWorkerRepairs = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {
      worker: req.user._id,
      status: { $in: ["in_progress", "completed"] },
    };

    if (status) filter.status = status;

    const repairs = await RepairRequest.find(filter)
      .populate({
        path: "customer",
        select: "username profile.phone profile.address",
      })
      .sort("-updatedAt");

    if (!repairs.length) throw createHttpError(404, "No repairs found");

    res.status(200).json({
      success: true,
      count: repairs.length,
      message: "Worker repairs retrieved",
      data: repairs,
    });
  } catch (error) {
    next(error);
  }
};

export const getWorkerHistory = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {
      worker: req.user._id,
      status: status || "completed",
    };

    const repairs = await RepairRequest.find(filter)
      .populate({
        path: "customer",
        select: "username profile.avatar",
      })
      .populate({
        path: "bids",
        select: "bidPrice estimatedTimeDays submittedAt",
      })
      .sort("-updatedAt");

    res.status(200).json({
      success: true,
      count: repairs.length,
      message: "Worker repair history retrieved",
      data: repairs,
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomerHistory = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {
      customer: req.user._id,
      ...(status && { status }),
    };

    const repairs = await RepairRequest.find(filter)
      .populate({
        path: "worker",
        select: "username profile.avatar rating.average",
      })
      .populate({
        path: "bids",
        select: "bidPrice estimatedTimeDays status worker",
        populate: {
          path: "worker",
          select: "username profile.avatar",
        },
      })
      .sort("-createdAt");

    res.status(200).json({
      success: true,
      count: repairs.length,
      message: "Customer repair history retrieved",
      data: repairs,
    });
  } catch (error) {
    next(error);
  }
};
