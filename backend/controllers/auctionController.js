import createHttpError from "http-errors";

import Auction from "../models/Auction.js";
import RepairRequest from "../models/RepairRequest.js";

export const acceptLowestBid = async (req, res, next) => {
  try {
    const auction = await Auction.findById(req.params.auctionId);

    if (!auction) throw createHttpError(404, "Auction not found");

    if (auction.repairRequest.customer.toString() !== req.user._id.toString())
      throw createHttpError(403, "Not authorized to accept bids");

    const updatedAuction = await auction.acceptLowestBid();

    // Update repair request
    await RepairRequest.findByIdAndUpdate(auction.repairRequest, {
      worker: updatedAuction.currentLowestBid.worker,
      status: "in_progress",
      paymentAmount: updatedAuction.currentLowestBid.bidPrice,
    });

    res.status(200).json({
      success: true,
      data: {
        acceptedBid: updatedAuction.currentLowestBid,
        repairStatus: "in_progress",
      },
      message: "Bid accepted successfully",
    });
  } catch (error) {
    next(createHttpError(400, error.message));
  }
};

export const getAuctionBids = async (req, res, next) => {
  try {
    const auction = await Auction.findById(req.params.auctionId)
      .populate({
        path: "bids.worker",
        select: "username profile.avatar rating.average",
      })
      .lean();

    if (!auction) throw createHttpError(404, "Auction not found");

    // Transform bids data
    const bids = auction.bids.map((bid) => ({
      ...bid,
      worker: bid.worker,
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

export const getAvailableAuctions = async (req, res, next) => {
  try {
    const { includeCustomer } = req.query;

    if (includeCustomer && req.user.role !== "admin") {
      throw createHttpError(403, "Unauthorized customer data request");
    }

    const query = await Auction.find({ status: "open" })
      .populate({
        path: "repairRequest",
        match: { status: "auction_open" },
        select: "title category itemType photos shippingRequired createdAt",
        populate: includeCustomer
          ? {
              path: "customer",
              select: "username profile.avatar rating.average",
            }
          : undefined,
      })
      .sort("-createdAt");

    const auctions = await query.lean();

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

// Helper function
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

export const submitBid = async (req, res, next) => {
  try {
    const auction = await Auction.findOne({
      _id: req.params.auctionId,
      status: "open",
    });

    if (!auction) throw createHttpError(404, "Active auction not found");

    const newBid = {
      worker: req.user._id,
      bidPrice: req.body.bidPrice,
      estimatedTimeDays: req.body.estimatedTimeDays,
      status: "pending",
    };

    const updatedAuction = await auction.submitBid(newBid);

    res.status(201).json({
      success: true,
      message: "Bid submitted successfully",
      data: {
        yourBid: newBid.bidPrice,
        currentLowestBid: updatedAuction.currentLowestBid.bidPrice,
      },
    });
  } catch (error) {
    next(createHttpError(400, error.message));
  }
};
