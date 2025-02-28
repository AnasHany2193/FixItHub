import createHttpError from "http-errors";

import Auction from "../models/Auction.js";
import RepairRequest, { RepairStatus } from "../models/RepairRequest.js";
import mongoose from "mongoose";
import Bid from "../models/Bid.js";

// ===================================================
//                REPAIR REQUEST FLOW
// ===================================================

/**
 * @desc    Create new repair request with optional auction
 * @route   POST /api/v1/repairs
 * @access  Private (Customer)
 */
export const createRepairRequest = async (req, res, next) => {
  try {
    const {
      title,
      category,
      issueDescription,
      itemType,
      startingMaxPrice, // Optional if no auction
      expiresAt, // Optional if no auction
      imageUrls,
      shippingRequired,
      createAuction = false, // New flag
    } = req.body;

    // Validate images
    if (!imageUrls?.length)
      throw createHttpError(400, "At least one image is required");

    // 1. Create base repair request
    const repairData = {
      customer: req.user._id,
      title,
      category,
      issueDescription,
      itemType,
      photos: imageUrls.map((img) => ({
        url: img.url,
        public_id: img.public_id,
      })),
      shippingRequired: shippingRequired || false,
      status: createAuction
        ? RepairStatus.AUCTION_OPEN
        : RepairStatus.AWAITING_ASSIGNMENT,
    };

    const repairRequest = await RepairRequest.create(repairData);

    // 2. Conditionally create auction
    if (createAuction) {
      if (!startingMaxPrice || !expiresAt)
        throw createHttpError(
          400,
          "Auction requires starting price and expiration"
        );

      if (new Date(expiresAt) <= new Date())
        throw createHttpError(400, "Auction must have future expiration date");

      const auction = await Auction.create({
        repairRequest: repairRequest._id,
        startingMaxPrice,
        expiresAt: new Date(expiresAt),
      });

      repairRequest.auction = auction._id;
      await repairRequest.save();
    }

    // 📧 Should send confirmation email to customer
    res.status(201).json({
      success: true,
      data: repairRequest,
      message: `Repair request created ${createAuction ? "with auction" : ""} successfully`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Start auction for existing repair request
 * @route   POST /api/v1/repairs/:id/auction
 * @access  Private (Customer)
 */
export const startRepairAuction = async (req, res, next) => {
  try {
    const { startingMaxPrice, expiresAt } = req.body;

    // 1. Find repair request with auction restart capability
    const repairRequest = await RepairRequest.findOne({
      _id: req.params.id,
      customer: req.user._id,
      status: {
        $in: [
          RepairStatus.AWAITING_ASSIGNMENT,
          RepairStatus.CANCELLED,
          RepairStatus.AUCTION_OPEN,
        ],
      },
    });

    if (!repairRequest)
      throw createHttpError(404, "Repair not found or cannot start auction");

    if (new Date(expiresAt) <= new Date())
      throw createHttpError(400, "Auction must have future expiration date");

    // 2. Auction creation/update logic
    let auction;
    if (repairRequest.auction) {
      // Update existing auction
      auction = await Auction.findByIdAndUpdate(
        repairRequest.auction,
        {
          startingMaxPrice,
          expiresAt: new Date(expiresAt),
          status: "open",
          $unset: { currentLowestBid: 1 }, // Reset bidding
        },
        { new: true, runValidators: true }
      );

      // Clear previous bids
      await Bid.deleteMany({ auction: auction._id });
    } else {
      // Create new auction
      auction = await Auction.create({
        repairRequest: repairRequest._id,
        startingMaxPrice,
        expiresAt: new Date(expiresAt),
        status: "open",
      });
      repairRequest.auction = auction._id;
    }

    // 3. Update repair status
    repairRequest.status = RepairStatus.AUCTION_OPEN;
    await repairRequest.save();

    res.status(200).json({
      success: true,
      data: { repair: repairRequest, auction },
      message:
        "Auction " +
        (repairRequest.auction ? "restarted" : "started") +
        "successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update repair request details
 * @route   PUT /api/v1/repairs/:id
 * @access  Private (Customer)
 */
export const updateRepairRequest = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { id } = req.params;
    const {
      title,
      category,
      issueDescription,
      itemType,
      startingMaxPrice,
      expiresAt,
      imageUrls = [],
      removedImageIds = [],
      shippingRequired,
      createAuction = false,
    } = req.body;

    console.log({
      title,
      category,
      issueDescription,
      itemType,
      startingMaxPrice,
      expiresAt,
      imageUrls,
      removedImageIds,
      shippingRequired,
      createAuction,
    });

    // 1. Validate repair ownership and status
    const existingRepair = await RepairRequest.findOne({
      _id: id,
      customer: req.user._id,
      status: {
        $in: [
          RepairStatus.AWAITING_ASSIGNMENT,
          RepairStatus.AUCTION_OPEN,
          RepairStatus.CANCELLED,
        ],
      },
    }).session(session);

    if (!existingRepair)
      throw createHttpError(404, "Repair not found or cannot be modified");

    // 2. Determine new status
    let newStatus;
    if (existingRepair.status === RepairStatus.CANCELLED) {
      newStatus = createAuction
        ? RepairStatus.AUCTION_OPEN
        : RepairStatus.AWAITING_ASSIGNMENT;
    } else {
      newStatus = createAuction
        ? RepairStatus.AUCTION_OPEN
        : existingRepair.status;
    }

    // 3. Handle image updates
    // Filter out removed images and add new ones
    const existingPhotoPublicIds = new Set(
      existingRepair.photos.map((img) => img.public_id)
    );

    const newUniquePhotos = imageUrls.filter(
      (img) => !existingPhotoPublicIds.has(img.public_id)
    );

    const updatedPhotos = [
      ...existingRepair.photos.filter(
        (img) => !removedImageIds.includes(img.public_id)
      ),
      ...newUniquePhotos, // Only add images that don't exist
    ];

    // 4. Prepare update payload
    const updatePayload = {
      title,
      category,
      issueDescription,
      itemType,
      shippingRequired,
      status: newStatus,
      photos: updatedPhotos,
    };

    // 5. Handle auction-related fields
    if (createAuction) {
      updatePayload.startingMaxPrice = startingMaxPrice;
      updatePayload.expiresAt = expiresAt;
    }

    // 6. Update repair document
    const updatedRepair = await RepairRequest.findByIdAndUpdate(
      id,
      updatePayload,
      { new: true, session, runValidators: true }
    ).populate("auction");

    // 7. Handle auction creation/update
    if (createAuction) {
      if (existingRepair.auction) {
        await Auction.findByIdAndUpdate(
          existingRepair.auction,
          {
            startingMaxPrice,
            expiresAt,
            status: "open",
          },
          { session }
        );
      } else {
        const auction = await Auction.create(
          [
            {
              repairRequest: updatedRepair._id,
              startingMaxPrice,
              expiresAt,
              status: "open",
            },
          ],
          { session }
        );
        updatedRepair.auction = auction[0]._id;
        await updatedRepair.save({ session });
      }
    }

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      data: updatedRepair,
      message: "Repair request updated successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

/**
 * @desc    Get single repair request details
 * @route   GET /api/v1/repairs/:id
 * @access  Private (Customer)
 */
export const getRepairRequest = async (req, res, next) => {
  try {
    const repair = await RepairRequest.findOne({
      _id: req.params.id,
      customer: req.user._id,
    })
      .populate({
        path: "bids",
        select: "bidPrice estimatedTimeDays status submittedAt",
        populate: {
          path: "worker",
          select: "username profile.avatar rating.average",
        },
      })
      .populate({
        path: "auction",
        select: "status expiresAt startingMaxPrice currentLowestBid",
      })
      .populate({
        path: "worker",
        select: "username profile.avatar rating.average",
      });

    if (!repair) throw createHttpError(404, "Repair request not found");

    res.status(200).json({
      success: true,
      data: repair,
      message: "Repair request details retrieved",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's repair requests
 * @route   GET /api/v1/repairs
 * @access  Private (Customer)
 */
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
      .populate({
        path: "auction",
        select: "status expiresAt startingMaxPrice currentLowestBid",
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

// ===================================================
//                 REPAIR MANAGEMENT
// ===================================================

/**
 * @desc    Update repair request status
 * @route   PATCH /api/v1/repairs/:id/status
 * @access  Private (Customer)
 */
export const updateRepairStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const repairRequest = await RepairRequest.findOneAndUpdate(
      { _id: req.params.id, customer: req.user._id },
      { status },
      { new: true, runValidators: true }
    );

    if (!repairRequest) throw createHttpError(404, "Repair request not found");

    // 📧 Should send status update email to worker/customer
    res.status(200).json({
      success: true,
      data: repairRequest,
      message: "Repair status updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

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

/**
 * @desc    Get customer's repair history with filters
 * @route   GET /api/v1/repairs/customer/history
 * @access  Private (Customer)
 */
export const getCustomerHistory = async (req, res, next) => {
  try {
    const { status, bidStatus } = req.query;
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
        match: { status: bidStatus },
      })
      .populate({
        path: "auction",
        select: "status expiresAt startingMaxPrice currentLowestBid",
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
 * @desc    Cancel repair request and associated auction
 * @route   DELETE /api/v1/repairs/:id
 * @access  Private (Customer)
 * @note    Sends cancellation email to customer
 */
export const cancelRepairRequest = async (req, res, next) => {
  try {
    // 1. Find and cancel the repair request
    const repairRequest = await RepairRequest.findOneAndUpdate(
      {
        _id: req.params.id,
        customer: req.user._id,
        status: {
          $in: [RepairStatus.AWAITING_ASSIGNMENT, RepairStatus.AUCTION_OPEN],
        },
      },
      { status: RepairStatus.CANCELLED },
      { new: true, runValidators: true }
    );

    if (!repairRequest)
      throw createHttpError(
        404,
        "Repair request not found or cannot be cancelled in current state"
      );

    // 2. Close associated auction using direct reference
    const auction = await Auction.findByIdAndUpdate(
      repairRequest.auction, // Use the stored auction reference
      { status: "closed" },
      { new: true, runValidators: true }
    );

    if (!auction) {
      throw createHttpError(
        500,
        "Associated auction not found - data inconsistency detected"
      );
    }

    // 📧 Should send cancellation email to customer

    // 3. Return combined response
    res.status(200).json({
      success: true,
      message: "Repair request and auction cancelled successfully",
      data: {
        repair: repairRequest,
        auction: {
          _id: auction._id,
          status: auction.status,
          expiresAt: auction.expiresAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

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
