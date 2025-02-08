import createHttpError from "http-errors";

import Auction from "../models/Auction.js";
import RepairRequest from "./../models/RepairRequest.js";

// POST: Create auction for a repair request
export const createAuction = async (req, res, next) => {
  const { repairRequestId, auctionDurationHours } = req.body;

  try {
    // Validate repair request exists and belongs to the customer
    const repairRequest = await RepairRequest.findOne({
      _id: repairRequestId,
      customer: req.user._id,
    });
    if (!repairRequest) throw createHttpError(404, "Repair request not found");

    // Prevent duplicate auctions
    const existingAuction = await Auction.findOne({
      repairRequest: repairRequestId,
    });
    if (existingAuction) throw createHttpError(400, "Auction already exists");

    // Calculate expiration time
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + Number(auctionDurationHours));

    // Create auction
    const auction = await Auction.create({
      repairRequest: repairRequestId,
      expiresAt,
    });

    res.status(201).json({
      success: true,
      message: "Auction created",
      data: auction,
    });
  } catch (err) {
    next(err);
  }
};

// GET: List bids for an auction
export const listBids = async (req, res, next) => {
  try {
    const auction = await Auction.findById(req.params.id)
      .populate("bids.worker", "username profile rating")
      .lean();

    if (!auction) throw createHttpError(404, "Auction not found");

    res.status(200).json({
      success: true,
      message: "Bids retrieved",
      data: auction.bids,
    });
  } catch (err) {
    next(err);
  }
};

// PUT: Accept a bid (customer-only)
export const acceptBid = async (req, res, next) => {
  const { bidId } = req.body;

  try {
    const auction = await Auction.findOne({
      _id: req.params.id,
      status: "open",
    });
    if (!auction) throw createHttpError(404, "Auction not found or closed");

    // Find the bid and mark it as accepted
    const bid = auction.bids.id(bidId);
    if (!bid) throw createHttpError(404, "Bid not found");

    bid.status = "accepted";
    auction.status = "closed";
    await auction.save();

    // Update repair request status
    await RepairRequest.findByIdAndUpdate(auction.repairRequest, {
      status: "in_progress",
    });

    res.status(200).json({
      success: true,
      message: "Bid accepted. Repair in progress!",
    });
  } catch (err) {
    next(err);
  }
};
