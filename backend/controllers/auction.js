import mongoose from "mongoose";
import createHttpError from "http-errors";

// Models
import User from "../models/User.js";
import Auction from "../models/Auction.js";
import RepairRequest from "../models/RepairRequest.js";

// Notifications
import { sendEmail } from "./../services/emailService.js";
import {
  bidAcceptedEmailTemplate,
  bidRejectedEmailTemplate,
} from "../utils/emailTemplates.js";

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

    // Add this check after fetching repairRequest
    if (repairRequest.status !== "pending") {
      throw createHttpError(
        400,
        "Auction can only be created for pending repair requests"
      );
    }

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
  const session = await mongoose.startSession(); // For transactions
  session.startTransaction();

  try {
    // 1. Validate Auction and Bid
    const auction = await Auction.findOne({
      _id: req.params.id,
      status: "open",
    }).session(session);
    if (!auction) throw createHttpError(404, "Auction not found or closed");

    // Find the bid and mark it as accepted
    const bid = auction.bids.id(bidId);
    if (!bid) throw createHttpError(404, "Bid not found");
    if (bid.status !== "pending")
      throw createHttpError(400, "Bid already processed");

    // 2. Validate Worker Status
    const worker = await User.findById(bid.worker).session(session);
    if (!worker?.isApprovedWorker())
      throw createHttpError(403, "Worker not approved");

    // 3. Update Auction (reject other bids)
    bid.status = "accepted";
    auction.status = "closed";
    auction.bids.forEach((otherBid) => {
      if (otherBid._id.toString() !== bidId) otherBid.status = "rejected";
    });
    await auction.save({ session });

    // 4. Update Repair Request (with transaction)
    const repairRequest = await RepairRequest.findOneAndUpdate(
      { _id: auction.repairRequest, customer: req.user._id }, // Security: Ensure customer owns request
      {
        worker: bid.worker,
        paymentAmount: bid.price,
        status: "in_progress",
        $push: { trackingUpdates: { status: "worker_assigned" } },
      },
      { new: true, session }
    ).populate("customer", "username email");
    if (!repairRequest) throw createHttpError(404, "Repair request not found");

    // 5. Send Notifications (fire-and-forget)
    try {
      await sendEmail({
        to: worker.email,
        subject: `🎉 Bid Accepted for ${repairRequest.itemType}`,
        html: bidAcceptedEmailTemplate(
          repairRequest.itemType,
          bid.price,
          repairRequest.customer.username
        ),
      });
    } catch (emailErr) {
      console.error("Failed to send worker email:", emailErr);
    }

    // 6. Send rejection emails (optional)
    try {
      const rejectedBids = auction.bids.filter((b) => b.status === "rejected");
      await Promise.all(
        rejectedBids.map(async (rejectedBid) => {
          const worker = await User.findById(rejectedBid.worker).session(
            session
          );
          await sendEmail({
            to: worker.email,
            subject: `🚫 Bid Rejected for ${repairRequest.itemType}`,
            html: bidRejectedEmailTemplate(repairRequest.itemType),
          });
        })
      );
    } catch (emailErr) {
      console.error("Failed to send rejection emails:", emailErr);
    }

    // 7. Commit Transaction
    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "Bid accepted. Repair in progress!",
      data: {
        repairRequestId: repairRequest._id,
        acceptedBid: bid.price,
        workerId: worker._id,
      },
    });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
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

    if (price < 1) throw createHttpError(400, "Bid must be at least $1");

    // Validate bid price ≤ maxBidPrice
    if (price > auction.maxBidPrice)
      throw createHttpError(
        400,
        `Bid exceeds maximum allowed price ($${auction.maxBidPrice})`
      );

    if (auctionDurationHours < 1 || auctionDurationHours > 168)
      throw createHttpError(
        400,
        "Auction duration must be 1 hour : 7 days (168h)"
      );

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
