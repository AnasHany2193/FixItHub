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

AuctionSchema.pre("save", function (next) {
  const auction = this;

  // Check for duplicate worker bids
  const workerIds = new Set();
  for (const bid of auction.bids) {
    if (workerIds.has(bid.worker.toString()))
      return next(new Error("Worker can only bid once per auction"));

    workerIds.add(bid.worker.toString());
  }

  next();
});

const Auction = mongoose.model("Auction", AuctionSchema);
export default Auction;
