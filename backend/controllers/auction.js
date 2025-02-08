import createHttpError from "http-errors";

// Models
import User from "../models/User.js";
import Auction from "../models/Auction.js";
import RepairRequest from "../models/RepairRequest.js";

// Notifications
import { sendEmail } from "./../services/emailService.js";
import { bidAcceptedEmailTemplate } from "../utils/emailTemplates.js";

// POST: Create auction for a repair request
export const createAuction = async (req, res, next) => {
  const { repairRequestId, auctionDurationHours, maxBidPrice } = req.body;

  try {
    // Validate repair request exists and belongs to the customer
    const repairRequest = await RepairRequest.findOne({
      _id: repairRequestId,
      customer: req.user._id,
    });
    if (!repairRequest) throw createHttpError(404, "Repair request not found");

    // Validate maxBidPrice
    if (maxBidPrice <= 0)
      throw createHttpError(400, "Maximum bid price must be a positive number");

    // Prevent duplicate auctions
    const existingAuction = await Auction.findOne({
      repairRequest: repairRequestId,
    });
    if (existingAuction) throw createHttpError(400, "Auction already exists");

    // Create auction
    const auction = await Auction.create({
      repairRequest: repairRequestId,
      maxBidPrice, // ✅ Added
      expiresAt: new Date(Date.now() + auctionDurationHours * 60 * 60 * 1000),
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

    // Sort bids by price (lowest first)
    const sortedBids = auction.bids.sort((a, b) => a.price - b.price);

    res.status(200).json({
      success: true,
      data: sortedBids,
      message: "Bids retrieved",
      maxBidPrice: auction.maxBidPrice,
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

    const worker = await User.findById(bid.worker);
    const repairRequest = await RepairRequest.findById(
      auction.repairRequest
    ).populate("customer", "username");

    repairRequest.worker = bid.worker;
    repairRequest.paymentAmount = bid.price;
    repairRequest.status = "in_progress";
    await repairRequest.save();

    // Send notification to worker
    await sendEmail({
      to: worker.email,
      subject: `🎉 Bid Accepted for ${repairRequest.itemType}`,
      html: bidAcceptedEmailTemplate(
        repairRequest.itemType,
        bid.price,
        repairRequest.customer.username
      ),
    });

    res.status(200).json({
      success: true,
      message: "Bid accepted. Repair in progress!",
    });
  } catch (err) {
    next(err);
  }
};

// POST: Submit a bid (worker-only)
export const submitBid = async (req, res, next) => {
  const { price, estimatedTimeDays } = req.body;
  const { id: auctionId } = req.params;

  try {
    // Validate worker is approved
    const worker = await User.findById(req.user._id);
    if (!worker.isApprovedWorker())
      throw createHttpError(403, "Only approved workers can bid");

    // Validate auction exists and is open
    const auction = await Auction.findOne({
      _id: auctionId,
      status: "open",
      expiresAt: { $gt: new Date() }, // Auction hasn't expired
    });
    if (!auction) throw createHttpError(400, "Auction closed or invalid");

    // Validate bid price ≤ maxBidPrice
    if (price > auction.maxBidPrice) {
      throw createHttpError(
        400,
        `Bid exceeds maximum allowed price ($${auction.maxBidPrice})`
      );
    }

    // Add bid
    auction.bids.push({
      worker: worker._id,
      price,
      estimatedTimeDays,
    });
    await auction.save();

    res.status(201).json({
      success: true,
      message: "Bid submitted",
      data: auction.bids[auction.bids.length - 1], // Return the new bid
    });
  } catch (err) {
    next(err);
  }
};
