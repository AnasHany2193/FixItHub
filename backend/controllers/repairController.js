import createHttpError from "http-errors";

import Bid from "../models/Bid.js";
import Offer from "../models/Offer.js";
import Auction from "../models/Auction.js";

import RepairRequest, {
  RepairStatus,
  trackingStatusOrder,
} from "../models/RepairRequest.js";

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
      .populate([
        {
          path: "auction",
          select: "status expiresAt startingMaxPrice currentLowestBid bids",
          populate: [
            {
              path: "currentLowestBid",
              select: "bidPrice worker",
              populate: {
                path: "worker",
                select: "username profile.avatar rating.average",
              },
            },
            {
              path: "bids",
              select: "bidPrice status submittedAt worker",
              populate: {
                path: "worker",
                select: "username profile.avatar rating.average",
              },
            },
          ],
        },
        {
          path: "worker",
          select: "username profile.avatar rating.average",
        },
      ])
      .lean();

    if (!repair) throw createHttpError(404, "Repair not found");

    // Extract bids from auction if exists
    const response = {
      ...repair,
      proposals: repair.auction?.bids || [],
      auction: {
        ...repair.auction,
        currentLowest:
          repair.auction?.currentLowestBid?.bidPrice ||
          repair.auction?.startingMaxPrice,
      },
    };

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

export const getRepairRequests = async (req, res, next) => {
  try {
    const filter = { customer: req.user._id };

    // Exclude historical statuses
    const excludedStatuses = [
      "completed",
      "cancelled",
      "returning_to_customer",
    ];

    if (req.query.status) {
      filter.status = req.query.status;
    } else {
      filter.status = { $nin: excludedStatuses }; // Exclude historical statuses
    }

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
    console.log("---------------------------------------------");
    const { status } = req.query;
    console.log("status", status);
    console.log("req.user._id", req.user._id);
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

export const acceptBid = async (req, res, next) => {
  try {
    const { repairId } = req.params;
    const { bidId } = req.body;
    const customerId = req.user._id;

    // 1. Find repair and validate
    const repair = await RepairRequest.findOne({
      _id: repairId,
      customer: customerId,
      status: RepairStatus.AUCTION_OPEN,
    });
    if (!repair)
      return res.status(404).json({
        success: false,
        message: "Repair not found or not in auction state",
      });

    // 2. Find bid and validate
    const bid = await Bid.findOne({ _id: bidId, auction: repair.auction });
    if (!bid)
      return res
        .status(404)
        .json({ success: false, message: "Bid not found in this auction" });

    // 3. Update bids - SIMPLE VERSION
    await Bid.findByIdAndUpdate(bidId, { status: "accepted" });
    await Bid.updateMany(
      { auction: repair.auction, _id: { $ne: bidId } },
      { status: "rejected" }
    );

    // 4. Close auction and update repair
    await Auction.findByIdAndUpdate(repair.auction, { status: "closed" });
    const updatedRepair = await RepairRequest.findByIdAndUpdate(
      repairId,
      {
        worker: bid.worker,
        status: RepairStatus.IN_PROGRESS,
        paymentAmount: bid.bidPrice,
        paymentStatus: "pending",
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Bid accepted successfully",
      data: updatedRepair,
    });
  } catch (error) {
    next(error);
  }
};

export const getNonAuctionRepairs = async (req, res, next) => {
  try {
    const { category, itemType, sortBy } = req.query;

    const filter = {
      status: RepairStatus.AWAITING_ASSIGNMENT,
      auction: null, // Ensure no auction exists
    };

    if (category) filter.category = category;
    if (itemType) filter.itemType = { $regex: itemType, $options: "i" };

    const sortOptions = {
      newest: "-createdAt",
      price: "-startingMaxPrice",
    };

    const repairs = await RepairRequest.find(filter)
      .select("-customer -paymentIntentId -trackingUpdates")
      .sort(sortOptions[sortBy] || "-createdAt")
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

export const getNonAuctionRepairDetails = async (req, res, next) => {
  try {
    const repair = await RepairRequest.findOne({
      _id: req.params.id,
      status: RepairStatus.AWAITING_ASSIGNMENT,
      auction: null,
    })
      .populate("worker", "username rating.average")
      .select("-customer -paymentIntentId");

    if (!repair) {
      return res.status(404).json({
        success: false,
        message: "Non-auction repair not found",
      });
    }

    res.status(200).json({
      success: true,
      data: repair,
    });
  } catch (error) {
    next(error);
  }
};

export const submitOffer = async (req, res, next) => {
  try {
    const { repairId } = req.params;
    const { offerPrice } = req.body;
    const workerId = req.user._id;

    // Validate repair
    const repair = await RepairRequest.findOne({
      _id: repairId,
      status: RepairStatus.AWAITING_ASSIGNMENT,
      auction: null,
    });

    if (!repair) {
      return res.status(400).json({
        success: false,
        message: "Repair not available for offers",
      });
    }

    // Check existing offer
    const existingOffer = await Offer.findOne({
      repairRequest: repairId,
      worker: workerId,
    });

    if (existingOffer) {
      return res.status(409).json({
        success: false,
        message: "You already submitted an offer for this repair",
      });
    }

    // Create offer
    const offer = await Offer.create({
      worker: workerId,
      repairRequest: repairId,
      offerPrice,
    });

    res.status(201).json({
      success: true,
      message: "Offer submitted successfully",
      data: offer,
    });
  } catch (error) {
    next(error);
  }
};

export const updateOffer = async (req, res, next) => {
  try {
    const { offerId } = req.params;
    const { offerPrice } = req.body;
    const workerId = req.user._id;

    const offer = await Offer.findOneAndUpdate(
      {
        _id: offerId,
        worker: workerId,
        status: "pending",
      },
      { offerPrice },
      { new: true, runValidators: true }
    );

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found or cannot be modified",
      });
    }

    res.status(200).json({
      success: true,
      message: "Offer updated successfully",
      data: offer,
    });
  } catch (error) {
    next(error);
  }
};

export const acceptOffer = async (req, res, next) => {
  try {
    const { repairId } = req.params;
    const { offerId } = req.body;
    const customerId = req.user._id;

    // Validate repair ownership
    const repair = await RepairRequest.findOne({
      _id: repairId,
      customer: customerId,
      status: RepairStatus.AWAITING_ASSIGNMENT,
    });

    if (!repair) {
      return res.status(404).json({
        success: false,
        message: "Repair not found or not eligible",
      });
    }

    // Validate offer
    const offer = await Offer.findOne({
      _id: offerId,
      repairRequest: repairId,
    });

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found for this repair",
      });
    }

    // Update offer statuses
    await Offer.findByIdAndUpdate(offerId, { status: "accepted" });
    await Offer.updateMany(
      { repairRequest: repairId, _id: { $ne: offerId } },
      { status: "rejected" }
    );

    // Update repair
    const updatedRepair = await RepairRequest.findByIdAndUpdate(
      repairId,
      {
        worker: offer.worker,
        status: RepairStatus.IN_PROGRESS,
        paymentAmount: offer.offerPrice,
        paymentStatus: "pending",
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Offer accepted successfully",
      data: updatedRepair,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTrackingStatus = async (req, res, next) => {
  try {
    const { repairId } = req.params;
    const { status } = req.body;

    // Validate status
    if (!trackingStatusOrder.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status.`,
      });
    }

    const update = {
      $push: {
        trackingUpdates: {
          status,
          timestamp: new Date(),
        },
      },
    };

    // Update main status when reaching awaiting_payment
    if (status === "awaiting_payment")
      update.$set = { status: "awaiting_payment" };

    // Find and Update repair
    const repair = await RepairRequest.findOneAndUpdate(
      {
        _id: repairId,
        worker: req.user._id,
        status: { $ne: "completed" }, // Prevent updates on completed repairs
      },
      update,
      { new: true, runValidators: true }
    );

    if (!repair) {
      return res.status(404).json({
        success: false,
        message: "Repair not found or not authorized",
      });
    }

    res.status(200).json({
      success: true,
      message: "Tracking status updated",
      data: {
        tracking: repair.trackingUpdates,
        status: repair.status,
      },
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
      status: status
        ? { $in: status.split(",") }
        : { $in: [RepairStatus.IN_PROGRESS, RepairStatus.AWAITING_PAYMENT] },
    };

    const repairs = await RepairRequest.find(filter)
      .populate({
        path: "customer",
        select: "username profile.avatar",
      })
      .populate({
        path: "auction",
        select: "status expiresAt currentLowestBid",
        populate: {
          path: "currentLowestBid",
          select: "bidPrice",
        },
      })
      .populate({
        path: "offers",
        match: { status: "accepted" },
        select: "price status",
      })
      .sort("-createdAt")
      .lean();

    const enhancedRepairs = repairs.map((repair) => ({
      ...repair,
      sourceType: repair.auction ? "auction" : "direct",
      currentPrice:
        repair.auction?.currentLowestBid?.bidPrice ||
        repair.offers?.[0]?.price ||
        "Not specified",
    }));

    res.status(200).json({
      success: true,
      count: enhancedRepairs.length,
      data: enhancedRepairs,
    });
  } catch (error) {
    next(error);
  }
};

export const getWorkerRepair = async (req, res, next) => {
  try {
    const { id } = req.params;

    const repair = await RepairRequest.findById(id)
      .populate("customer", "username profile.avatar")
      .populate({
        path: "auction",
        select: "status expiresAt startingMaxPrice currentLowestBid",
        populate: {
          path: "currentLowestBid",
          select: "bidPrice",
        },
      })
      .populate({
        path: "offers",
        match: { status: "accepted" },
        select: "price status",
      })
      .lean();

    if (!repair) {
      return res
        .status(404)
        .json({ success: false, message: "Repair not found" });
    }

    res.status(200).json({
      success: true,
      data: repair,
    });
  } catch (error) {
    next(error);
  }
};

export const completeRepair = async (req, res, next) => {
  try {
    const { id } = req.params;
    const workerId = req.user._id;

    const repair = await RepairRequest.findOneAndUpdate(
      {
        _id: id,
        worker: workerId,
        status: RepairStatus.IN_PROGRESS,
      },
      {
        status: RepairStatus.COMPLETED,
        $push: {
          trackingUpdates: {
            status: "completed",
            timestamp: new Date(),
          },
        },
      },
      { new: true, runValidators: true }
    );

    if (!repair) {
      return res.status(404).json({
        success: false,
        message: "Repair not found or not eligible for completion",
      });
    }

    res.status(200).json({
      success: true,
      message: "Repair marked as completed",
      data: repair,
    });
  } catch (error) {
    next(error);
  }
};

export const returnRepair = async (req, res, next) => {
  try {
    const { id } = req.params;
    const workerId = req.user._id;
    const { reason } = req.body;

    const repair = await RepairRequest.findOneAndUpdate(
      {
        _id: id,
        worker: workerId,
        status: RepairStatus.IN_PROGRESS,
      },
      {
        status: RepairStatus.RETURNING_TO_CUSTOMER,
        $push: {
          trackingUpdates: {
            status: "return_initiated",
            details: reason || "Unable to complete repair",
            timestamp: new Date(),
          },
        },
      },
      { new: true }
    ).populate("customer", "name email");

    if (!repair) {
      return res.status(404).json({
        success: false,
        message: "Repair not found or not eligible for return",
      });
    }

    res.status(200).json({
      success: true,
      message: "Repair return initiated",
      data: repair,
    });
  } catch (error) {
    next(error);
  }
};

export const getWorkerRepairsHistory = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {
      worker: req.user._id,
      ...(status && { status }),
    };

    const repairs = await RepairRequest.find(filter)
      .populate("customer", "name email")
      .populate({
        path: "auction",
        select: "startingMaxPrice",
        match: { status: "closed" },
      })
      .sort("-createdAt")
      .lean();

    const history = repairs.map((repair) => ({
      _id: repair._id,
      itemType: repair.itemType,
      status: repair.status,
      paymentStatus: repair.paymentStatus,
      completedAt: repair.trackingUpdates.find((t) => t.status === "completed")
        ?.timestamp,
      customer: repair.customer,
      price: repair.auction?.startingMaxPrice || repair.paymentAmount,
    }));

    res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};
