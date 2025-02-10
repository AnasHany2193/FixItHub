import mongoose from "mongoose";

export const bidSchema = new mongoose.Schema(
  {
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bidPrice: {
      type: Number,
      required: true,
    },
    estimatedTimeDays: {
      type: Number,
      required: true,
      min: [1, "Estimate must be at least 1 day"],
    },
    auction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auction",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

bidSchema.index({ auction: 1, worker: 1 }, { unique: true });
bidSchema.index({ bidPrice: 1 });

const Bid = mongoose.model("Bid", bidSchema);
export default Bid;
