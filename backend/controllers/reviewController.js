import createHttpError from "http-errors";

import Review from "../models/Review.js";
import Reservation from "../models/Reservation.js";
import RepairRequest from "../models/RepairRequest.js";

// ===================== Validation Helpers =====================
const validateReviewOwnership = async (customerId, entityId, model) => {
  const exists = await model.exists({
    _id: entityId,
    customer: customerId,
    status: "completed",
  });
  if (!exists) throw createHttpError(403, "Not authorized to review this");
};

// ===================== Controller Methods =====================
// Create Worker Review
export const createWorkerReview = async (req, res, next) => {
  try {
    const { repairId, rating, comment } = req.body;
    const repair = await RepairRequest.findById(repairId);

    if (!repair?.worker) {
      throw createHttpError(404, "Associated worker not found");
    }

    await validateReviewOwnership(req.user._id, repairId, RepairRequest);

    const review = await Review.create({
      kind: "WorkerReview",
      customer: req.user._id,
      rating,
      comment,
      repairRequest: repairId,
      worker: repair.worker,
    });

    res.status(201).json({
      success: true,
      data: review,
      message: "Worker review submitted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Create Product Review
export const createProductReview = async (req, res, next) => {
  try {
    const { reservationId } = req.body;
    const reservation = await Reservation.findOne({
      _id: reservationId,
      user: req.user._id,
      status: "completed",
    }).populate("product");

    if (!reservation?.product) {
      throw createHttpError(404, "Associated product not found");
    }

    const review = await Review.create({
      kind: "ProductReview",
      customer: req.user._id,
      ...req.body,
      product: reservation.product._id,
      reservation: reservationId,
    });

    res.status(201).json({
      success: true,
      data: review,
      message: "Product review submitted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Update Review
export const updateReview = async (req, res, next) => {
  try {
    const review = await Review.findOne({
      _id: req.params.reviewId,
      customer: req.user._id,
    });

    if (!review) throw createHttpError(404, "Review not found");

    // Preserve original values if not provided
    review.rating = req.body.rating ?? review.rating;
    review.comment = req.body.comment ?? review.comment;

    const updatedReview = await review.save();
    await updateAssociatedRating(updatedReview);

    res.json({
      success: true,
      data: updatedReview,
      message: "Review updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Delete Review
export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findOneAndDelete({
      _id: req.params.reviewId,
      customer: req.user._id,
    });

    if (!review) throw createHttpError(404, "Review not found");
    await updateAssociatedRating(review);

    res.json({
      success: true,
      data: null,
      message: "Review deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Add getReviews controller
export const getReviews = (kind) => async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const id = req.params[kind === "WorkerReview" ? "workerId" : "productId"];
    const filterField = kind === "WorkerReview" ? "worker" : "product";

    const [reviews, stats] = await Promise.all([
      Review.find({ kind, [filterField]: id })
        .populate("customer", "username profile.avatar")
        .sort("-createdAt")
        .skip((page - 1) * limit)
        .limit(limit),
      Review.aggregate([
        { $match: { kind, [filterField]: mongoose.Types.ObjectId(id) } },
        {
          $group: {
            _id: null,
            average: { $avg: "$rating" },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        reviews,
        average: stats[0]?.average?.toFixed(1) || 0,
        total: stats[0]?.count || 0,
      },
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: stats[0]?.count || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ===================== Rating Utilities =====================
const updateAssociatedRating = async (review) => {
  const targetModel = review.kind === "WorkerReview" ? "User" : "Product";
  const targetId =
    review[review.kind === "WorkerReview" ? "worker" : "product"];

  const stats = await Review.aggregate([
    { $match: { [targetModel === "User" ? "worker" : "product"]: targetId } },
    {
      $group: {
        _id: null,
        average: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  const update = stats[0]
    ? { rating: stats[0] }
    : { rating: { average: 0, count: 0 } };

  await mongoose
    .model(targetModel)
    .findByIdAndUpdate(
      targetId,
      { $set: update },
      { new: true, runValidators: true }
    );
};

// ===================== Change Stream Setup =====================
const setupChangeStream = () => {
  const changeStream = Review.watch([], { fullDocument: "updateLookup" });

  changeStream.on("change", async (change) => {
    try {
      let review;
      switch (change.operationType) {
        case "insert":
          review = change.fullDocument;
          break;
        case "update":
          review = await Review.findById(change.documentKey._id);
          break;
        case "delete":
          review = change.documentKey;
          break;
      }

      if (review) await updateAssociatedRating(review);
    } catch (error) {
      console.error("Change stream processing error:", error.message);
    }
  });

  changeStream.on("error", (error) => {
    console.error("Change stream connection error:", error.message);
    setTimeout(setupChangeStream, 5000);
  });
};

setupChangeStream();
