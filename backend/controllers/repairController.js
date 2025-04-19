import createHttpError from "http-errors";

import Auction from "../models/Auction.js";
import RepairRequest, { RepairStatus } from "../models/RepairRequest.js";
import {
  createAuctionForRepair,
  handleAuctionUpdate,
  updateExistingAuction,
  createNewAuction,
} from "./auctionController.js";

export const createRepairRequest = async (req, res, next) => {
  try {
    const { user, body } = req;
    const {
      title,
      category,
      issueDescription,
      itemType,
      imageUrls,
      shippingRequired = false,
      createAuction = false,
      auctionDetails, // New grouped field
    } = body;

    // Base repair data
    const repairData = {
      customer: user._id,
      title,
      category,
      issueDescription,
      itemType,
      photos: imageUrls.map(({ url, public_id }) => ({ url, public_id })),
      shippingRequired,
      status: createAuction
        ? RepairStatus.AUCTION_OPEN
        : RepairStatus.AWAITING_ASSIGNMENT,
    };

    // Create repair with optional auction
    const repairRequest = await RepairRequest.create(repairData);

    if (createAuction) {
      const { startingMaxPrice, expiresAt } = auctionDetails || {};
      await createAuctionForRepair(repairRequest._id, {
        startingMaxPrice,
        expiresAt,
      });
    }

    res.status(201).json({
      success: true,
      data: repairRequest,
      message: `Repair request created${createAuction ? " with auction" : ""}`,
    });
  } catch (error) {
    next(error);
  }
};

export const updateRepairRequest = async (req, res, next) => {
  try {
    const {
      user,
      params: { id },
      body,
    } = req;
    const {
      title,
      category,
      issueDescription,
      itemType,
      imageUrls = [],
      removedImageIds = [],
      shippingRequired,
      createAuction = false,
      auctionDetails,
    } = body;

    // Find and validate repair
    const existingRepair = await RepairRequest.findOne({
      _id: id,
      customer: user._id,
      status: { $nin: [RepairStatus.IN_PROGRESS, RepairStatus.COMPLETED] },
    });
    if (!existingRepair) throw createHttpError(404, "Repair not found");

    // Update images
    const updatedPhotos = [
      ...existingRepair.photos.filter(
        (img) => !removedImageIds.includes(img.public_id)
      ),
      ...imageUrls.filter(
        (img) =>
          !existingRepair.photos.some((e) => e.public_id === img.public_id)
      ),
    ];

    // Update repair
    const updatedRepair = await RepairRequest.findByIdAndUpdate(
      id,
      {
        title,
        category,
        issueDescription,
        itemType,
        shippingRequired,
        photos: updatedPhotos,
        status: getNewStatus(existingRepair.status, createAuction),
      },
      { new: true, runValidators: true }
    );

    // Handle auction updates
    if (createAuction) {
      const { startingMaxPrice, expiresAt } = auctionDetails || {};
      await handleAuctionUpdate(existingRepair, {
        startingMaxPrice,
        expiresAt,
      });
    }

    res.status(200).json({
      success: true,
      data: updatedRepair,
      message: "Repair request updated",
    });
  } catch (error) {
    next(error);
  }
};

export const getNewStatus = (currentStatus, createAuction) => {
  return createAuction ? RepairStatus.AUCTION_OPEN : currentStatus;
};

export const startRepairAuction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { startingMaxPrice, expiresAt } = req.body;
    const userId = req.user._id;

    console.log({ startingMaxPrice, expiresAt });

    const repair = await RepairRequest.findOne({
      _id: id,
      customer: userId,
      status: { $in: ["awaiting_assignment", "cancelled", "auction_open"] },
    });
    if (!repair) throw createHttpError(404, "Repair not found");

    const auctionData = { startingMaxPrice, expiresAt: new Date(expiresAt) };
    const auction = repair.auction
      ? await updateExistingAuction(repair.auction, auctionData)
      : await createNewAuction(repair._id, auctionData);

    repair.status = "auction_open";
    repair.auction = auction._id;
    await repair.save();

    res.status(200).json({
      success: true,
      data: { repair, auction },
      message: `Auction ${repair.auction ? "updated" : "started"}`,
    });
  } catch (error) {
    next(error);
  }
};

export const getRepairRequest = async (req, res, next) => {
  try {
    const repair = await RepairRequest.findOne({
      _id: req.params.id,
      customer: req.user._id,
    })
      .populate("auction", "status expiresAt startingMaxPrice")
      .populate("worker", "username avatar")
      .lean();

    if (!repair) throw createHttpError(404, "Repair not found");
    res.status(200).json({
      success: true,
      data: repair,
    });
  } catch (error) {
    next(error);
  }
};

export const getRepairRequests = async (req, res, next) => {
  try {
    const filter = { customer: req.user._id };
    if (req.query.status) filter.status = req.query.status;

    const repairs = await RepairRequest.find(filter)
      .populate("auction", "status expiresAt")
      .sort("-createdAt")
      .lean();

    res.status(200).json({
      success: true,
      count: repairs.length,
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
      status: status || {
        $in: ["completed", "cancelled", "returning_to_customer"],
      },
    };

    const repairs = await RepairRequest.find(filter)
      .populate("worker", "username avatar")
      .populate("auction", "status expiresAt")
      .sort("-createdAt")
      .lean();

    res.status(200).json({
      success: true,
      data: repairs,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelRepairRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Update repair status
    const repair = await RepairRequest.findOneAndUpdate(
      {
        _id: id,
        customer: userId,
        status: RepairStatus.AUCTION_OPEN,
      },
      { status: RepairStatus.CANCELLED },
      { new: true }
    );

    if (!repair) throw createHttpError(404, "Repair not found");

    // Close related auction if exists
    if (repair.auction) {
      await Auction.findByIdAndUpdate(repair.auction, { status: "closed" });
    }

    res.status(200).json({
      success: true,
      data: repair,
      message: "Repair cancelled successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ===================================================
//                 REPAIR MANAGEMENT
// ===================================================

/**
 * @desc    Mark repair as completed
 * @route   POST /api/v1/repairs/:id/complete
 * @access  Private (Worker)
 */
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

    // 📧 Should send completion email to customer
    res.status(200).json({
      success: true,
      message: "Repair marked as completed",
      data: repairRequest,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update shipping tracking
 * @route   POST /api/v1/repairs/:id/shipping
 * @access  Private (Worker)
 */
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

    // 📧 Should send shipping update email to customer
    res.status(200).json({
      success: true,
      message: "Shipping status updated",
      data: repairRequest.trackingUpdates,
    });
  } catch (error) {
    next(error);
  }
};

// ===================================================
//                 WORKER DASHBOARD
// ===================================================

/**
 * @desc    Get worker's assigned repairs
 * @route   GET /api/v1/repairs/worker
 * @access  Private (Worker)
 */
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

// ===================================================
//                 REPAIR HISTORY
// ===================================================

/**
 * @desc    Get worker's completed repair history
 * @route   GET /api/v1/repairs/worker/history
 * @access  Private (Worker)
 */
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

// ===================================================
//                 AUCTION MANAGEMENT
// ===================================================

/**
 * @desc    Get customer's active auctions
 * @route   GET /api/v1/repairs/customer/auctions
 * @access  Private (Customer)
 */
export const getCustomerAuctions = async (req, res, next) => {
  try {
    const repairs = await RepairRequest.find({
      customer: req.user._id,
      status: "auction_open",
    }).populate({
      path: "auction",
      select: "status expiresAt startingMaxPrice bids",
    });

    res.status(200).json({
      data: repairs.map((r) => r.auction),
      count: repairs.length,
      message: "Customer auctions retrieved successfully",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

// ===================================================
//                 REPAIR CANCELLATION
// ===================================================

/**
 * @desc    Initiate item return to customer
 * @route   POST /api/v1/repairs/:id/return
 * @access  Private (Worker)
 * @note    Sends return notification to customer
 */
export const cancelAndReturnItem = async (req, res, next) => {
  try {
    const repairRequest = await RepairRequest.findOne({
      _id: req.params.id,
      worker: req.user._id,
      status: "in_progress",
    });

    if (!repairRequest)
      throw createHttpError(404, "Repair not found or not in progress");

    repairRequest.status = "returning_to_customer";
    repairRequest.trackingUpdates.push({
      status: "return_initiated",
      location: "Preparing for return shipment",
      details: "Item could not be repaired, initiating return",
    });

    await repairRequest.save();

    // 📧 Should send return notification email
    res.status(200).json({
      success: true,
      message: "Return process initiated",
      data: {
        status: repairRequest.status,
        tracking: repairRequest.trackingUpdates,
      },
    });
  } catch (error) {
    next(error);
  }
};
