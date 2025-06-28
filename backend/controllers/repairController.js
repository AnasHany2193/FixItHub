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
          path: "offers",
          select: "offerPrice status createdAt worker",
          populate: {
            path: "worker",
            select: "username profile.avatar rating.average",
          },
        },
        {
          path: "worker",
          select: "username profile.avatar rating.average",
        },
      ])
      .lean();

    if (!repair) throw createHttpError(404, "Repair not found");

    // Determine repair type and format response accordingly
    const isAuction = !!repair.auction;
    const baseData = {
      ...repair,
      type: isAuction ? "auction" : "direct-offer",
      proposals: isAuction ? repair.auction?.bids || [] : repair.offers || [],
    };

    // Add type-specific data
    const response = isAuction
      ? {
          ...baseData,
          auction: {
            ...repair.auction,
            currentLowest:
              repair.auction?.currentLowestBid?.bidPrice ||
              repair.auction?.startingMaxPrice,
            bidCount: repair.auction?.bids?.length || 0,
          },
        }
      : {
          ...baseData,
          offers: {
            averageOffer: repair.offers?.length
              ? repair.offers.reduce((sum, o) => sum + o.offerPrice, 0) /
                repair.offers.length
              : null,
            offerCount: repair.offers?.length || 0,
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
    const excludedStatuses = [
      "completed",
      "cancelled",
      "returning_to_customer",
    ];

    // Status filtering
    filter.status = req.query.status
      ? req.query.status
      : { $nin: excludedStatuses };

    const repairs = await RepairRequest.find(filter)
      .populate([
        {
          path: "auction",
          select: "status expiresAt bids currentLowestBid",
          populate: {
            path: "currentLowestBid",
            select: "bidPrice",
          },
        },
        {
          path: "offers",
          select: "offerPrice status",
          match: { status: "pending" },
        },
      ])
      .sort("-createdAt")
      .lean();

    // Transform data for frontend
    const enhancedRepairs = repairs.map((repair) => ({
      ...repair,
      type: repair.auction ? "auction" : "direct",
      currentPrice:
        repair.auction?.currentLowestBid?.bidPrice ||
        repair.offers?.[0]?.offerPrice ||
        repair.auction?.startingMaxPrice,
      bidCount: repair.auction?.bids?.length || 0,
      offerCount: repair.offers?.length || 0,
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

export const getCustomerHistory = async (req, res, next) => {
  try {
    const { status } = req.query;
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
        $push: {
          trackingUpdates: {
            status: "received",
            timestamp: new Date(),
          },
        },
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

export const getDirectOffersRepairs = async (req, res, next) => {
  try {
    const { category, sort = "newest" } = req.query;

    const repairs = await RepairRequest.find({
      status: RepairStatus.AWAITING_ASSIGNMENT,
      auction: null,
      ...(category && category !== "all" && { category }),
    })
      .populate({
        path: "customer",
        select: "username profile.avatar",
      })
      .populate({
        path: "offers",
        select: "offerPrice",
        match: { status: "pending" },
      })
      .sort(sort === "price" ? { "offers.offerPrice": -1 } : { createdAt: -1 })
      .lean();

    const enhancedRepairs = repairs.map((repair) => {
      const validOffers = repair.offers?.filter((o) => o.offerPrice) || [];
      const total = validOffers.reduce((sum, o) => sum + o.offerPrice, 0);
      const average =
        validOffers.length > 0 ? total / validOffers.length : null;

      return {
        ...repair,
        offerCount: validOffers.length,
        averageOffer: average ? Math.round(average * 100) / 100 : null, // Keep 2 decimal places
      };
    });

    res.status(200).json({ success: true, data: enhancedRepairs });
  } catch (error) {
    next(error);
  }
};

export const getDirectOffersRepairDetails = async (req, res, next) => {
  try {
    const repair = await RepairRequest.findOne({
      _id: req.params.id,
      status: RepairStatus.AWAITING_ASSIGNMENT,
      auction: null,
    })
      .populate({
        path: "customer",
        select: "username profile.avatar createdAt",
      })
      .populate({
        path: "offers",
        select: "offerPrice status createdAt worker",
        populate: {
          path: "worker",
          select: "_id username profile.avatar",
        },
      })
      .lean();

    if (!repair) throw createHttpError(404, "Active repair not found");

    // Convert to string for consistent comparison
    const userId = req.user._id.toString();

    const validOffers = repair.offers?.filter((o) => o.offerPrice) || [];
    const total = validOffers.reduce((sum, o) => sum + o.offerPrice, 0);
    const averageOffer =
      validOffers.length > 0
        ? Math.round((total / validOffers.length) * 100) / 100
        : null;

    const response = {
      ...repair,
      averageOffer,
      offerCount: validOffers.length,
      hasOffer: validOffers.some((o) => o.worker?._id?.toString() === userId),
      myOffer: validOffers.find((o) => o.worker?._id?.toString() === userId),
    };

    res.status(200).json({
      success: true,
      data: response,
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

    // Validate offer price
    if (offerPrice < 1) {
      return res.status(400).json({
        success: false,
        message: "Minimum offer price is $1",
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
    const newOffer = await Offer.create({
      worker: workerId,
      repairRequest: repairId,
      offerPrice,
    });

    // Update repair request
    await RepairRequest.findByIdAndUpdate(repairId, {
      $push: { offers: newOffer._id },
    });

    res.status(201).json({
      success: true,
      message: "Offer submitted successfully",
      data: newOffer,
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

    // Find existing offer
    const existingOffer = await Offer.findOne({
      _id: offerId,
      worker: workerId,
      status: "pending",
    }).populate("repairRequest");

    if (!existingOffer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found or cannot be modified",
      });
    }

    // Validate repair status
    const repair = await RepairRequest.findById(
      existingOffer.repairRequest._id
    );

    if (repair.status !== RepairStatus.AWAITING_ASSIGNMENT || repair.auction) {
      return res.status(400).json({
        success: false,
        message: "Cannot update offer on assigned repair",
      });
    }

    // Validate new offer price
    if (offerPrice < 1) {
      return res.status(400).json({
        success: false,
        message: "Minimum offer price is $1",
      });
    }

    // Update offer
    existingOffer.offerPrice = offerPrice;
    await existingOffer.save();

    res.status(200).json({
      success: true,
      message: "Offer updated successfully",
      data: existingOffer,
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

    // 1. Find repair and validate
    const repair = await RepairRequest.findOne({
      _id: repairId,
      customer: customerId,
      status: RepairStatus.AWAITING_ASSIGNMENT,
    });

    if (!repair) {
      return res.status(404).json({
        success: false,
        message: "Repair not found or not eligible for offer acceptance",
      });
    }

    // 2. Find offer and validate
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

    // 3. Update offers - same pattern as bids
    await Offer.findByIdAndUpdate(offerId, { status: "accepted" });
    await Offer.updateMany(
      { repairRequest: repairId, _id: { $ne: offerId } },
      { status: "rejected" }
    );

    // 4. Update repair - similar structure to bid acceptance
    const updatedRepair = await RepairRequest.findByIdAndUpdate(
      repairId,
      {
        worker: offer.worker,
        status: RepairStatus.IN_PROGRESS,
        paymentAmount: offer.offerPrice,
        paymentStatus: "pending",
        $push: {
          trackingUpdates: {
            status: "received",
            timestamp: new Date(),
          },
        },
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
        select: "status expiresAt startingMaxPrice currentLowestBid", // Added startingMaxPrice
        populate: {
          path: "currentLowestBid",
          select: "bidPrice worker", // Added worker for context
        },
      })
      .populate({
        path: "offers",
        match: { status: "accepted" },
        select: "offerPrice status", // Fixed field name (price → offerPrice)
      })
      .sort("-createdAt")
      .lean();

    const enhancedRepairs = repairs.map((repair) => ({
      ...repair,
      sourceType: repair.auction ? "auction" : "direct",
      currentPrice:
        repair.auction?.currentLowestBid?.bidPrice ||
        repair.offers?.[0]?.offerPrice || // Fixed field name
        repair.auction?.startingMaxPrice || // Added fallback
        null,
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
    const { repairId } = req.params;
    const workerId = req.user._id;

    // Find the repair request and ensure it is in progress and payment has been received
    const repair = await RepairRequest.findOneAndUpdate(
      {
        _id: repairId,
        worker: workerId,
        status: RepairStatus.IN_PROGRESS,
        paymentStatus: "paid", // Ensure payment has been received
      },
      {
        status: RepairStatus.COMPLETED,
        $push: {
          trackingUpdates: {
            status: "shipped",
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
    const { repairId } = req.params;
    const workerId = req.user._id;

    // Find the repair request and ensure it is in progress and not paid
    const repair = await RepairRequest.findOneAndUpdate(
      {
        _id: repairId,
        worker: workerId,
        status: RepairStatus.IN_PROGRESS,
        paymentStatus: { $ne: "paid" }, // Ensure the payment status is not 'paid'
      },
      {
        status: RepairStatus.RETURNING_TO_CUSTOMER,
        paymentStatus: "refunded",
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
    const { status, limit = 20, offset = 0 } = req.query;
    const filter = {
      worker: req.user._id,
      status: { $in: ["completed", "returning_to_customer"] },
      ...(status && status !== "all" && { status }),
    };

    const [repairs, count] = await Promise.all([
      RepairRequest.find(filter)
        .populate("customer", "username profile.avatar")
        .populate({
          path: "auction",
          select: "startingMaxPrice currentLowestBid",
          match: { status: "closed" },
        })
        .populate({
          path: "offers",
          match: { status: "accepted" },
          select: "offerPrice",
        })
        .sort("-createdAt")
        .skip(Number(offset))
        .limit(Number(limit))
        .lean(),
      RepairRequest.countDocuments(filter),
    ]);

    const history = repairs.map((repair) => ({
      _id: repair._id,
      itemType: repair.itemType,
      title: repair.title,
      status: repair.status,
      paymentStatus: repair.paymentStatus,
      completedAt: repair.trackingUpdates.find((t) => t.status === "shipped")
        ?.timestamp,
      customer: repair.customer,
      price:
        repair.auction?.currentLowestBid?.bidPrice ||
        repair.offers?.[0]?.offerPrice ||
        repair.paymentAmount,
      sourceType: repair.auction ? "auction" : "direct",
      createdAt: repair.createdAt,
    }));

    res.status(200).json({
      success: true,
      count,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

// Submit a rating for a worker
export const submitWorkerRating = async (req, res, next) => {
  try {
    const { repairId } = req.params;
    const { rating } = req.body;
    const customerId = req.user._id;

    // Validate rating
    if (!rating || rating < 1 || rating > 5)
      throw createHttpError.BadRequest("Rating must be between 1 and 5");

    // Find the repair
    const repair = await RepairRequest.findById(repairId);
    if (!repair) throw createHttpError.NotFound("Repair not found");

    // Verify customer is the requester
    if (repair.customer.toString() !== customerId.toString())
      throw createHttpError.Forbidden("Only the repair's customer can rate");

    // Check if already rated (optional, assumes isRated field)
    if (repair.isRated)
      throw createHttpError.BadRequest("You have already rated this repair");

    // Find the worker
    const worker = await User.findById(repair.worker);
    if (!worker) throw createHttpError.NotFound("Worker not found");

    // Update worker's rating
    const currentCount = worker.rating.count || 0;
    const currentAverage = worker.rating.average || 0;
    const newCount = currentCount + 1;
    const newAverage = (currentAverage * currentCount + rating) / newCount;

    worker.rating.average = parseFloat(newAverage.toFixed(1));
    worker.rating.count = newCount;
    await worker.save();

    // Mark repair as rated (optional, requires isRated field in Repair model)
    repair.isRated = true;
    await repair.save();

    res.status(201).json({
      success: true,
      message: "Rating submitted successfully",
      data: {
        workerId: worker._id,
        rating: worker.rating,
      },
    });
  } catch (error) {
    next(error);
  }
};
