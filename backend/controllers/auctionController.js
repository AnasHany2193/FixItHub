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

/**
 * @desc    Get all open auctions with filters
 * @route   GET /api/v1/auctions
 * @access  Private (Worker)
 */
export const getOpenAuctions = async (req, res, next) => {
  try {
    const { category, maxPrice, sortBy, search } = req.query;

    const query = {
      status: "open",
      expiresAt: { $gt: new Date() },
      ...(maxPrice && { startingMaxPrice: { $lte: Number(maxPrice) } }),
    };

    const aggregation = [
      { $match: query },
      {
        $lookup: {
          from: "repairrequests",
          localField: "repairRequest",
          foreignField: "_id",
          as: "repair",
        },
      },
      { $unwind: "$repair" },
      {
        $lookup: {
          from: "users",
          localField: "repair.customer",
          foreignField: "_id",
          as: "customer",
        },
      },
      { $unwind: "$customer" },
      {
        $match: {
          ...(category &&
            category !== "all" && { "repair.category": category }),
          ...(search && {
            $or: [
              { "repair.title": new RegExp(search, "i") },
              { "repair.issueDescription": new RegExp(search, "i") },
              { "repair.itemType": new RegExp(search, "i") },
            ],
          }),
        },
      },
      {
        $project: {
          startingMaxPrice: 1,
          expiresAt: 1,
          status: 1,
          currentLowestBid: 1,
          "repair.title": 1,
          "repair.category": 1,
          "repair.itemType": 1,
          "repair.photos": 1,
          "repair.issueDescription": 1,
          "customer.username": 1,
          "customer.profile.avatar": 1,
        },
      },
      {
        $sort: sortBy === "price" ? { startingMaxPrice: 1 } : { expiresAt: 1 },
      },
    ];

    const auctions = await Auction.aggregate(aggregation);
    res.status(200).json({ success: true, data: auctions });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get full auction details with repair info and bids
 * @route   GET /api/v1/auctions/:id
 * @access  Private (Worker)
 */
export const getAuctionDetails = async (req, res, next) => {
  try {
    const auction = await Auction.findOne({
      _id: req.params.id,
      status: "open",
      expiresAt: { $gt: new Date() },
    })
      .populate({
        path: "repairRequest",
        populate: {
          path: "customer",
          select: "username profile.avatar",
        },
      })
      .populate({
        path: "bids",
        select: "bidPrice status createdAt worker",
        populate: {
          path: "worker",
          select: "_id username profile.avatar",
        },
      })
      .populate({
        path: "currentLowestBid",
        select: "bidPrice worker",
        populate: {
          path: "worker",
          select: "_id username profile.avatar",
        },
      })
      .lean();

    if (!auction) throw createHttpError(404, "Active auction not found");

    // Convert to string for consistent comparison
    const userId = req.user._id.toString();

    const response = {
      ...auction,
      hasBid: auction.bids.some((b) => b.worker?._id?.toString() === userId),
      myBid: auction.bids.find((b) => b.worker?._id?.toString() === userId),
      currentLowest:
        auction.currentLowestBid?.bidPrice || auction.startingMaxPrice,
    };

    res.status(200).json({ data: response });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit new bid on auction
 * @route   POST /api/v1/auctions/:auctionId/bids
 * @access  Private (Worker)
 */
export const submitBid = async (req, res, next) => {
  try {
    const { auctionId } = req.params;
    const { bidPrice } = req.body;
    console.log("bidPrice", bidPrice);
    console.log("auctionId", auctionId);
    const workerId = req.user._id;

    // 1. Validate auction
    const auction = await Auction.findOne({
      _id: auctionId,
      status: "open",
      expiresAt: { $gt: new Date() },
    }).populate("currentLowestBid");

    if (!auction) {
      return res.status(400).json({
        success: false,
        message: "Auction not found or closed",
      });
    }

    // 2. Validate bid price
    const currentLowest =
      auction.currentLowestBid?.bidPrice || auction.startingMaxPrice;

    if (bidPrice >= currentLowest) {
      return res.status(400).json({
        success: false,
        message: `Bid must be lower than current lowest (${currentLowest})`,
      });
    }

    if (bidPrice > auction.startingMaxPrice) {
      return res.status(400).json({
        success: false,
        message: `Bid exceeds maximum price (${auction.startingMaxPrice})`,
      });
    }

    // 3. Create bid
    const newBid = await Bid.create({
      worker: workerId,
      auction: auctionId,
      bidPrice,
    });

    // 4. Update auction
    auction.bids.push(newBid._id);
    auction.currentLowestBid = newBid._id;
    await auction.save();

    res.status(201).json({
      success: true,
      message: "Bid submitted successfully",
      data: newBid,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You already submitted a bid for this auction",
      });
    }
    next(error);
  }
};

/**
 * @desc    Update existing bid
 * @route   PUT /api/v1/bids/:bidId
 * @access  Private (Worker)
 */
export const updateBid = async (req, res, next) => {
  try {
    const { bidId } = req.params;
    const { bidPrice } = req.body;
    const workerId = req.user._id;

    // 1. Find existing bid
    const existingBid = await Bid.findOne({
      _id: bidId,
      worker: workerId,
      status: "pending",
    }).populate("auction");

    if (!existingBid) {
      return res.status(404).json({
        success: false,
        message: "Bid not found or cannot be modified",
      });
    }

    // 2. Validate auction status
    const auction = await Auction.findById(existingBid.auction._id).populate(
      "currentLowestBid"
    );

    if (auction.status !== "open" || auction.expiresAt <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Cannot update bid on closed auction",
      });
    }

    // 3. Validate new bid price
    const currentLowestPrice =
      auction.currentLowestBid?.bidPrice || auction.startingMaxPrice;

    if (bidPrice >= currentLowestPrice) {
      return res.status(400).json({
        success: false,
        message: `New bid must be lower than current lowest (${currentLowestPrice})`,
      });
    }

    // 4. Update bid
    existingBid.bidPrice = bidPrice;
    await existingBid.save();

    // 5. Update auction's current lowest bid
    const isCurrentLowest = auction.currentLowestBid?._id.equals(
      existingBid._id
    );

    if (bidPrice < currentLowestPrice || isCurrentLowest) {
      // Find the actual lowest bid in case multiple bids exist
      const lowestBid = await Bid.findOne({ auction: auction._id })
        .sort({ bidPrice: 1 })
        .limit(1);

      if (lowestBid) {
        auction.currentLowestBid = lowestBid._id;
        await auction.save();
      }
    }

    // Update auction if this was the lowest bid
    if (auction.currentLowestBid?.toString() === bidId) {
      auction.currentLowestBid = existingBid._id;
      await auction.save();
    }

    res.status(200).json({
      success: true,
      message: "Bid updated successfully",
      data: existingBid,
    });
  } catch (error) {
    next(error);
  }
};
