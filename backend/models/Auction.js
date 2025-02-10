import mongoose from "mongoose";

import Bid from "./Bid.js";

const AuctionSchema = new mongoose.Schema(
  {
    repairRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RepairRequest",
      required: true,
      unique: true, // One auction per repair request
    },
    startingMaxPrice: {
      type: Number,
      required: true,
      min: [1, "Starting price must be at least 1"],
    },
    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },
    expiresAt: {
      type: Date,
      required: true,
      validate: {
        validator: (v) => v > new Date(),
        message: "Auction expiration must be in the future",
      },
    },
    bids: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bid",
      },
    ],
    currentLowestBid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bid",
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Indexes
AuctionSchema.index({ status: 1, expiresAt: -1 }); // For active auction queries
AuctionSchema.index({ "bids.worker": 1 }); // For bid uniqueness checks
AuctionSchema.index({ "currentLowestBid.bidPrice": 1 }); // For price-based queries

// Virtuals
AuctionSchema.virtual("isExpired").get(function () {
  return this.expiresAt <= new Date();
});

// Methods
AuctionSchema.methods.submitBid = async function (newBidData) {
  if (this.status !== "open") throw new Error("Auction is closed for bidding");

  // Validate against starting price
  if (newBidData.bidPrice > this.startingMaxPrice)
    throw new Error(
      `Bid exceeds maximum starting price of ${this.startingMaxPrice}`
    );

  // Validate against current lowest
  if (
    this.currentLowestBid &&
    newBidData.bidPrice >= this.currentLowestBid.bidPrice
  )
    throw new Error(
      `Bid must be lower than current lowest bid (${this.currentLowestBid.bidPrice})`
    );

  // Add validation for existing worker bid
  const existingBid = this.bids.find(
    (b) => b.worker.toString() === newBidData.worker.toString()
  );
  if (existingBid)
    throw new Error("Worker already submitted a bid for this auction");

  // Create new Bid document
  const newBid = new Bid({
    ...newBidData,
    auction: this._id,
  });
  await newBid.save(); // Proceed with bid submission

  // Add bid reference to auction
  this.bids.push(newBid._id);

  // Check if this is the lowest bid
  if (!this.currentLowestBid) {
    this.currentLowestBid = newBid._id;
  } else {
    const currentLowest = await Bid.findById(this.currentLowestBid);
    if (newBid.bidPrice < currentLowest.bidPrice) {
      this.currentLowestBid = newBid._id;
    }
  }

  return this.save();
};

AuctionSchema.methods.acceptLowestBid = async function () {
  if (!this.currentLowestBid) throw new Error("No bids to accept");

  // Mark all bids
  this.bids = this.bids.map((bid) => ({
    ...bid.toObject(),
    status:
      bid.bidPrice === this.currentLowestBid.bidPrice ? "accepted" : "rejected",
  }));

  this.status = "closed";
  return this.save();
};

// Add static method
AuctionSchema.statics.closeExpiredAuctions = async function () {
  return this.updateMany(
    {
      status: "open",
      expiresAt: { $lte: new Date() },
    },
    { $set: { status: "closed" } }
  );
};

const Auction = mongoose.model("Auction", AuctionSchema);
export default Auction;
