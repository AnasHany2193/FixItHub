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
