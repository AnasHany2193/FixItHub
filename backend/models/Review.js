import mongoose from "mongoose";
import { RepairStatus } from "./RepairRequest.js";

/**
 * @typedef {Object} BaseReview
 * @property {number} rating - 1-5 star rating
 * @property {string} [comment] - Optional review text (max 500 chars)
 * @property {mongoose.Types.ObjectId} customer - Reviewing user
 */
const reviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Minimum rating is 1"],
      max: [5, "Maximum rating is 5"],
    },
    comment: {
      type: String,
      maxlength: [500, "Comment cannot exceed 500 characters"],
      trim: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Customer reference is required"],
      index: true,
    },
  },
  {
    timestamps: true,
    discriminatorKey: "reviewType",
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Worker-specific Review
const workerReviewSchema = new mongoose.Schema({
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Worker reference is required"],
    index: true,
  },
  repairRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RepairRequest",
    required: [true, "Repair request reference is required"],
    validate: {
      validator: async function (v) {
        const repair = await mongoose.model("RepairRequest").findOne({
          _id: v,
          customer: this.parent().customer,
          status: RepairStatus.COMPLETED,
        });
        return !!repair;
      },
      message: "Can only review completed repairs",
    },
  },
});

// Product-specific Review
const productReviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: [true, "Product reference is required"],
    index: true,
  },
  reservation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Reservation",
    required: [true, "Reservation reference is required"],
    validate: {
      validator: async function (v) {
        const reservation = await mongoose.model("Reservation").findOne({
          _id: v,
          user: this.parent().customer,
          status: "completed",
        });
        return !!reservation;
      },
      message: "Can only review purchased products",
    },
  },
});

const Review = mongoose.model("Review", reviewSchema);
Review.discriminator("WorkerReview", workerReviewSchema);
Review.discriminator("ProductReview", productReviewSchema);

export default Review;
