import mongoose from "mongoose";

export const bidSchema = new mongoose.Schema({
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  bidPrice: {
    type: Number,
    required: true,
    min: 0.01,
  },
  auction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Auction",
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
  submittedAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
});

// Prevent duplicate bids
bidSchema.index({ auction: 1, worker: 1 }, { unique: true });

const Bid = mongoose.model("Bid", bidSchema);
export default Bid;
