import createHttpError from "http-errors";

import Auction from "../models/Auction.js";
import RepairRequest from "../models/RepairRequest.js";

export const submitBid = async (req, res, next) => {
  try {
    const auction = await Auction.findOne({
      repairRequest: req.params.repairId,
      status: "open",
    }).populate("repairRequest");

    if (!auction) throw createHttpError(404, "Active auction not found");

    const newBid = {
      worker: req.user._id,
      bidPrice: req.body.bidPrice,
      estimatedTimeDays: req.body.estimatedTimeDays,
    };

    await auction.submitBid(newBid);

    res.status(201).json({
      success: true,
      message: "Bid submitted successfully",
      currentLowestBid: auction.currentLowestBid,
    });
  } catch (error) {
    next(error);
  }
};

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
