import mongoose from "mongoose";

const bidSchema = new mongoose.Schema({
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  bidPrice: {
    type: Number,
    required: true,
    validate: {
      validator: function (v) {
        const auction = this.parent();
        return (
          v <= auction.startingMaxPrice &&
          v < (auction.currentLowestBid?.bidPrice || Infinity)
        );
      },
      message: "Bid must be lower than current lowest bid and starting price",
    },
  },
  estimatedTimeDays: {
    type: Number,
    required: true,
    min: [1, "Estimate must be at least 1 day"],
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
  submittedAt: {
    type: Date,
    default: () => new Date(),
  },
});

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
    currentLowestBid: bidSchema,
    bids: [bidSchema],
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
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Indexes
AuctionSchema.index({ status: 1, expiresAt: -1 });
AuctionSchema.index({ "currentLowestBid.bidPrice": 1 });

// Virtuals
AuctionSchema.virtual("isExpired").get(function () {
  return this.expiresAt <= new Date();
});

// Methods
AuctionSchema.methods.submitBid = async function (newBid) {
  if (this.status !== "open") throw new Error("Auction is closed for bidding");

  if (newBid.bidPrice > this.startingMaxPrice)
    throw new Error("Bid exceeds maximum starting price");

  if (
    !this.currentLowestBid ||
    newBid.bidPrice < this.currentLowestBid.bidPrice
  )
    this.currentLowestBid = newBid;

  this.bids.push(newBid);
  return this.save();
};

AuctionSchema.methods.acceptLowestBid = async function () {
  if (!this.currentLowestBid) throw new Error("No bids to accept");

  this.bids.forEach((bid) => {
    bid.status = bid._id.equals(this.currentLowestBid._id)
      ? "accepted"
      : "rejected";
  });

  this.status = "closed";
  return this.save();
};

AuctionSchema.pre("save", function (next) {
  if (this.isExpired) this.status = "closed";

  next();
});

const Auction = mongoose.model("Auction", AuctionSchema);
export default Auction;
