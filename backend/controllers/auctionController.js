import createHttpError from "http-errors";

import Bid from "../models/Bid.js";
import Auction from "../models/Auction.js";
import RepairRequest, { RepairStatus } from "../models/RepairRequest.js";

export const createAuctionForRepair = async (
  repairId,
  { startingMaxPrice, expiresAt }
) => {
  if (!startingMaxPrice || !expiresAt)
    throw createHttpError(400, "Auction requires price and expiration");

  const auction = await Auction.create({
    repairRequest: repairId,
    startingMaxPrice,
    expiresAt: new Date(expiresAt),
  });

  await RepairRequest.findByIdAndUpdate(repairId, {
    auction: auction._id,
    status: RepairStatus.AUCTION_OPEN,
  });
};

export const handleAuctionUpdate = async (repair, auctionData) => {
  if (repair.auction)
    await Auction.findByIdAndUpdate(repair.auction, auctionData);
  else await createAuctionForRepair(repair._id, auctionData);
};

export const updateExistingAuction = async (auctionId, data) => {
  await Bid.deleteMany({ auction: auctionId });
  return Auction.findByIdAndUpdate(
    auctionId,
    { ...data, status: "open", $unset: { currentLowestBid: 1 } },
    { new: true }
  );
};

export const createNewAuction = (repairId, data) => {
  return Auction.create({ ...data, repairRequest: repairId });
};

// ===================================================
//                 BID MANAGEMENT
// ===================================================

/**
 * @desc    Submit new bid for an auction
 * @route   POST /api/v1/auctions/:auctionId/bids
 * @access  Private (Worker)
 */
export const submitBid = async (req, res, next) => {
  try {
    const auction = await Auction.findOne({
      _id: req.params.auctionId,
      status: "open",
    });

    if (!auction) throw createHttpError(404, "Active auction not found");

    const newBidData = {
      worker: req.user._id,
      bidPrice: req.body.bidPrice,
      estimatedTimeDays: req.body.estimatedTimeDays,
    };

    const updatedAuction = await auction.submitBid(newBidData);

    // Populate the new bid for response
    const currentLowestBid = await Bid.findById(
      updatedAuction.currentLowestBid
    );

    // 📧 Should send bid confirmation email to worker
    res.status(201).json({
      success: true,
      message: "Bid submitted successfully",
      data: {
        yourBid: newBidData.bidPrice,
        currentLowestBid: currentLowestBid.bidPrice,
      },
    });
  } catch (error) {
    next(createHttpError(400, error.message));
  }
};

/**
 * @desc    Update existing bid
 * @route   PATCH /api/v1/bids/:bidId
 * @access  Private (Worker)
 */
export const updateBid = async (req, res, next) => {
  try {
    const { bidPrice, estimatedTimeDays } = req.body;

    const bid = await Bid.findById(req.params.bidId)
      .populate("worker")
      .populate({
        path: "auction",
        populate: { path: "currentLowestBid" },
      });

    // Validate ownership
    if (bid.worker._id.toString() !== req.user._id.toString())
      throw createHttpError(403, "Not authorized to update this bid");

    // Validate auction status
    if (bid.auction.status !== "open")
      throw createHttpError(400, "Cannot update bid on closed auction");

    // Get current lowest price
    const currentLowest =
      bid.auction.currentLowestBid?.bidPrice || bid.auction.startingMaxPrice;

    if (bidPrice >= currentLowest)
      throw createHttpError(
        400,
        `New bid must be lower than current lowest (${currentLowest})`
      );

    // Update bid
    bid.bidPrice = bidPrice;
    bid.estimatedTimeDays = estimatedTimeDays;
    await bid.save();

    // Update auction's current lowest if needed
    if (bidPrice < currentLowest)
      await Auction.findByIdAndUpdate(bid.auction._id, {
        currentLowestBid: bid._id,
      });

    // 📧 Should send bid update notification to customer
    res.status(200).json({
      success: true,
      data: bid,
      message: "Bid updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ===================================================
//                 AUCTION QUERIES
// ===================================================

/**
 * @desc    Get all bids for specific auction
 * @route   GET /api/v1/auctions/:auctionId/bids
 * @access  Public
 */
export const getAuctionBids = async (req, res, next) => {
  try {
    const auction = await Auction.findById(req.params.auctionId)
      .populate({
        path: "bids",
        populate: {
          path: "worker",
          select: "username profile.avatar rating.average",
        },
      })
      .populate("currentLowestBid")
      .lean();

    if (!auction) throw createHttpError(404, "Auction not found");

    // Transform bids data
    const bids = auction.bids.map((bid) => ({
      ...bid,
      isLowest: bid._id.equals(auction.currentLowestBid?._id),
    }));

    res.status(200).json({
      success: true,
      data: {
        ...auction,
        bids,
        currentLowestBid: auction.currentLowestBid,
      },
      message: "Bids retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get list of available auctions
 * @route   GET /api/v1/auctions
 * @access  Public
 */
export const getAvailableAuctions = async (req, res, next) => {
  try {
    const { includeCustomer } = req.query;

    if (includeCustomer && req.user.role !== "admin") {
      throw createHttpError(403, "Unauthorized customer data request");
    }

    const auctions = await Auction.find({ status: "open" })
      .populate({
        path: "repairRequest",
        match: { status: "auction_open" },
        select: "title category itemType photos shippingRequired createdAt",
        populate: includeCustomer
          ? {
              path: "customer",
              select: "username profile.avatar rating.average",
            }
          : null,
      })
      .populate({
        path: "currentLowestBid",
        select: "bidPrice worker",
      })
      .sort("-createdAt")
      .lean();

    const transformedAuctions = auctions
      .filter((a) => a.repairRequest) // Filter out null repair requests
      .map((auction) => ({
        id: auction._id,
        startingMaxPrice: auction.startingMaxPrice,
        expiresAt: auction.expiresAt,
        currentLowestBid: auction.currentLowestBid?.bidPrice,
        repairRequest: transformRepairRequest(auction.repairRequest),
      }));

    if (!transformedAuctions.length)
      throw createHttpError(404, "No available auctions found");

    res.status(200).json({
      success: true,
      count: transformedAuctions.length,
      data: transformedAuctions,
      message: "Auctions retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ===================================================
//                 AUCTION ACTIONS
// ===================================================

/**
 * @desc    Accept lowest bid and start repair
 * @route   POST /api/v1/auctions/:auctionId/accept
 * @access  Private (Customer)
 */
export const acceptLowestBid = async (req, res, next) => {
  try {
    const auction = await Auction.findById(req.params.auctionId)
      .populate({
        path: "repairRequest",
        populate: { path: "customer" },
      })
      .populate("currentLowestBid");

    if (!auction) throw createHttpError(404, "Auction not found");

    if (
      auction.repairRequest.customer._id.toString() !== req.user._id.toString()
    )
      throw createHttpError(403, "Not authorized to accept bids");

    const updatedAuction = await auction.acceptLowestBid();

    // Update repair request with initial tracking
    const updatedRepair = await RepairRequest.findByIdAndUpdate(
      auction.repairRequest._id,
      {
        worker: updatedAuction.currentLowestBid.worker,
        status: "in_progress",
        paymentAmount: updatedAuction.currentLowestBid.bidPrice,
        $push: {
          trackingUpdates: {
            status: "diagnosing",
            location: "Workshop",
            details: "Repair initiated by worker",
          },
        },
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: {
        acceptedBid: updatedAuction.currentLowestBid,
        repair: updatedRepair,
      },
      message: "Bid accepted and repair started successfully",
    });
  } catch (error) {
    next(createHttpError(400, error.message));
  }
};

// ===================================================
//                  HELPER FUNCTIONS
// ===================================================

/**
 * Transform repair request data for client response
 */
const transformRepairRequest = (repair) => ({
  ...repair,
  customer: repair.customer
    ? {
        username: repair.customer.username,
        avatar: repair.customer.profile.avatar,
        rating: repair.customer.rating?.average,
      }
    : undefined,
});
