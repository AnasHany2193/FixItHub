import mongoose from "mongoose";

/**
 * @typedef {Object} Bid
 * @property {mongoose.Types.ObjectId} worker - Service provider submitting the bid
 * @property {number} bidPrice - Proposed price in platform currency
 * @property {number} estimatedTimeDays - Business days needed for completion
 * @property {mongoose.Types.ObjectId} auction - Associated auction
 * @property {'pending'|'accepted'|'rejected'} status - Bid approval state
 * @property {Date} submittedAt - Bid submission timestamp
 */
export const bidSchema = new mongoose.Schema(
  {
    // Bidder Information
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Worker reference is required"],
      index: true,
    },
    // Bid Details
    bidPrice: {
      type: Number,
      required: [true, "Bid price is required"],
      min: [0.01, "Bid must be at least 0.01"],
    },
    estimatedTimeDays: {
      type: Number,
      required: [true, "Time estimate is required"],
      min: [1, "Estimate must be at least 1 business day"],
    },

    // Auction Context
    auction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auction",
      required: [true, "Auction reference is required"],
      index: true,
    },

    status: {
      type: String,
      enum: {
        values: ["pending", "accepted", "rejected"],
        message: "Invalid bid status: {VALUE}",
      },
      default: "pending",
    },
    submittedAt: {
      type: Date,
      default: () => new Date(),
      immutable: true,
    },
  },
  {
    _id: true,
    timestamps: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index to prevent duplicate bids
bidSchema.index({ auction: 1, worker: 1 }, { unique: true });

// Index for price-based queries
bidSchema.index({ bidPrice: 1 });

const Bid = mongoose.model("Bid", bidSchema);
export default Bid;
