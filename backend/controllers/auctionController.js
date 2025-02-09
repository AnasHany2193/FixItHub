import createHttpError from "http-errors";

import Auction from "../models/Auction.js";
import RepairRequest from "../models/RepairRequest.js";

export const acceptBid = async (req, res, next) => {
  try {
    const auction = await Auction.findOne({
      repairRequest: req.params.repairId,
    }).populate("repairRequest");

    if (!auction) throw createHttpError(404, "Auction not found");

    if (auction.repairRequest.customer.toString() !== req.user._id.toString())
      throw createHttpError(403, "Not authorized to accept bids");

    await auction.acceptLowestBid();

    // Update repair request with selected worker
    await RepairRequest.findByIdAndUpdate(auction.repairRequest._id, {
      worker: auction.currentLowestBid.worker,
      status: "in_progress",
    });

    res.status(200).json({
      success: true,
      message: "Bid accepted successfully",
      acceptedBid: auction.currentLowestBid,
    });
  } catch (error) {
    next(error);
  }
};

export const getAuctionBids = async (req, res, next) => {
  try {
    const auction = await Auction.findOne({
      repairRequest: req.params.repairId,
    })
      .populate({
        path: "bids.worker",
        select: "username profile.avatar rating.average",
      })
      .sort("-bids.submittedAt");

    if (!auction) throw createHttpError(404, "Auction not found");

    res.status(200).json({
      success: true,
      message: "Bids retrieved successfully",
      data: auction.bids,
    });
  } catch (error) {
    next(error);
  }
};

export const getOpenAuctions = async (req, res, next) => {
  try {
    const auctions = await Auction.find({ status: "open" })
      .populate({
        path: "repairRequest",
        select: "title category itemType photos shippingRequired createdAt",
        match: { status: "auction_open" },
      })
      .sort("-createdAt");

    if (!auctions) throw createHttpError(404, "Auction not found");

    const validAuctions = auctions.filter((a) => a.repairRequest);

    res.status(200).json({
      success: true,
      count: validAuctions.length,
      message: "Open auctions retrieved",
      data: validAuctions.map((auction) => ({
        id: auction._id,
        startingMaxPrice: auction.startingMaxPrice,
        expiresAt: auction.expiresAt,
        currentLowestBid: auction.currentLowestBid?.bidPrice || null,
        repairRequest: auction.repairRequest,
      })),
    });
  } catch (error) {
    next(error);
  }
};

export const getAvailableRepairs = async (req, res, next) => {
  try {
    const auctions = await Auction.find({ status: "open" })
      .populate({
        path: "repairRequest",
        match: { status: "auction_open" },
        select: "title category itemType photos shippingRequired createdAt",
        populate: {
          path: "customer",
          select: "username profile.avatar rating.average",
        },
      })
      .sort("-createdAt");

    const validAuctions = auctions
      .filter((a) => a.repairRequest)
      .map((auction) => ({
        auctionId: auction._id,
        startingMaxPrice: auction.startingMaxPrice,
        expiresAt: auction.expiresAt,
        currentLowestBid: auction.currentLowestBid?.bidPrice || null,
        repairRequest: auction.repairRequest,
      }));

    if (!validAuctions.length) {
      throw createHttpError(404, "No available repair requests found");
    }

    res.status(200).json({
      success: true,
      count: validAuctions.length,
      message: "Available repair requests retrieved",
      data: validAuctions,
    });
  } catch (error) {
    next(error);
  }
};

export const submitBid = async (req, res, next) => {
  try {
    const auction = await Auction.findOne({
      _id: req.params.auctionId,
      status: "open",
    }).populate("repairRequest");

    if (!auction) throw createHttpError(404, "Active auction not found");

    if (auction.repairRequest.customer.toString() === req.user._id.toString())
      throw createHttpError(403, "Cannot bid on your own repair request");

    const existingBid = auction.bids.find(
      (b) => b.worker.toString() === req.user._id.toString()
    );

    if (existingBid)
      throw createHttpError(
        409,
        "You already submitted a bid for this auction"
      );

    const newBid = {
      worker: req.user._id,
      bidPrice: req.body.bidPrice,
      estimatedTimeDays: req.body.estimatedTimeDays,
    };

    // Validate bid price
    if (newBid.bidPrice > auction.startingMaxPrice)
      throw createHttpError(
        400,
        `Bid price cannot exceed ${auction.startingMaxPrice}`
      );

    if (
      auction.currentLowestBid &&
      newBid.bidPrice >= auction.currentLowestBid.bidPrice
    )
      throw createHttpError(
        400,
        `Bid must be lower than current lowest bid (${auction.currentLowestBid.bidPrice})`
      );

    await auction.submitBid(newBid);

    res.status(201).json({
      success: true,
      message: "Bid submitted successfully",
      data: {
        yourBid: newBid.bidPrice,
        currentLowestBid: auction.currentLowestBid?.bidPrice || "No bids yet",
      },
    });
  } catch (error) {
    next(error);
  }
};
