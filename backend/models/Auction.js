import mongoose from "mongoose";

const AuctionSchema = new mongoose.Schema(
  {
    repairRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RepairRequest",
      required: true,
      unique: true, // One auction per repair request
    },
    maxBidPrice: {
      type: Number,
      required: true,
      min: 1,
    },
    bids: [
      {
        worker: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        price: { type: Number, required: true, min: 1 },
        estimatedTimeDays: { type: Number, required: true },
        status: {
          type: String,
          enum: ["pending", "accepted", "rejected"],
          default: "pending",
        },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

AuctionSchema.index({ status: 1, expiresAt: -1 }); // For active auction queries
AuctionSchema.index({ "bids.worker": 1 }); // For bid uniqueness enforcement

AuctionSchema.virtual("isExpired").get(function () {
  return this.expiresAt <= new Date();
});

// Replace the pre-save hook with this DB-level constraint
AuctionSchema.index(
  { repairRequest: 1, "bids.worker": 1 },
  {
    unique: true,
    partialFilterExpression: { "bids.worker": { $exists: true } },
  }
);

const Auction = mongoose.model("Auction", AuctionSchema);
export default Auction;
