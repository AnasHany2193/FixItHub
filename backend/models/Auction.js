import mongoose from "mongoose";
import Bid from "./Bid.js";

/**
 * @typedef {Object} Auction
 * @property {mongoose.Types.ObjectId} repairRequest - Associated repair request
 * @property {number} startingMaxPrice - Maximum acceptable bid price
 * @property {'open'|'closed'} status - Auction state
 * @property {Date} expiresAt - Auction end timestamp
 * @property {mongoose.Types.ObjectId[]} bids - Submitted bids
 * @property {mongoose.Types.ObjectId} currentLowestBid - Currently leading bid
 */
const AuctionSchema = new mongoose.Schema(
  {
    repairRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RepairRequest",
      required: [true, "Repair request reference is required"],
      unique: true,
    },
    startingMaxPrice: {
      type: Number,
      required: [true, "Starting maximum price is required"],
      min: [1, "Minimum starting price is 1"],
    },
    status: {
      type: String,
      enum: {
        values: ["open", "closed"],
        message: "Invalid auction status: {VALUE}",
      },
      default: "open",
    },
    expiresAt: {
      type: Date,
      required: [true, "Expiration date is required"],
      validate: {
        validator: function (v) {
          return this.status === "open" ? v > Date.now() : true;
        },
        message: "Expiration must be future-dated for open auctions",
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
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for common query patterns
AuctionSchema.index({ status: 1, expiresAt: -1 }); // Active auction lookups
AuctionSchema.index({ "bids.worker": 1 }); // Worker bid history
AuctionSchema.index({ "currentLowestBid.bidPrice": 1 }); // Price monitoring

/**
 * Check if auction has expired
 * @returns {boolean} True if auction end time has passed
 */
AuctionSchema.virtual("isExpired").get(function () {
  return this.expiresAt <= new Date();
});

/**
 * Submit a new bid to the auction
 * @param {Object} newBidData - Bid details
 * @param {number} newBidData.bidPrice - Proposed price
 * @param {number} newBidData.estimatedTimeDays - Completion estimate
 * @param {mongoose.Types.ObjectId} newBidData.worker - Bidder reference
 * @returns {Promise<Auction>} Updated auction document
 * @throws {Error} If bid validation fails
 */
AuctionSchema.methods.submitBid = async function (newBidData) {
  try {
    if (this.status !== "open" || this.isExpired)
      throw createHttpError(400, "Auction is not accepting new bids");

    const existingBid = await Bid.findOne({
      auction: this._id,
      worker: newBidData.worker,
    });

    if (existingBid)
      throw createHttpError(
        409,
        "Worker already submitted a bid for this auction"
      );

    if (newBidData.bidPrice > this.startingMaxPrice)
      throw createHttpError(
        400,
        `Bid exceeds maximum starting price of ${this.startingMaxPrice}`
      );

    let currentLowestPrice = this.startingMaxPrice;
    if (this.currentLowestBid) {
      const currentLowestBidDoc = await Bid.findById(this.currentLowestBid);
      currentLowestPrice = currentLowestBidDoc.bidPrice;
    }

    if (newBidData.bidPrice >= currentLowestPrice)
      throw createHttpError(
        400,
        `Bid must be lower than current lowest bid (${currentLowestPrice})`
      );

    const newBid = new Bid({
      ...newBidData,
      auction: this._id,
    });
    await newBid.save();

    this.bids.push(newBid._id);
    this.currentLowestBid = newBid._id;

    return this.save();
  } catch (error) {
    if (error instanceof createHttpError.HttpError) throw error;
    throw createHttpError(500, "Bid submission failed", {
      details: error.message,
    });
  }
};

AuctionSchema.methods.acceptLowestBid = async function () {
  try {
    if (!this.currentLowestBid) throw createHttpError(404, "No bids to accept");

    // Populate bids to access full documents
    const auction = await this.populate("bids currentLowestBid");

    const updatedBids = await Promise.all(
      auction.bids.map(async (bid) => {
        bid.status = bid._id.equals(auction.currentLowestBid._id)
          ? "accepted"
          : "rejected";
        return bid.save();
      })
    );

    this.status = "closed";
    this.bids = updatedBids.map((b) => b._id);

    return this.save();
  } catch (error) {
    if (error instanceof createHttpError.HttpError) throw error;
    throw createHttpError(500, "Failed to accept bid", {
      details: error.message,
    });
  }
};

const Auction = mongoose.model("Auction", AuctionSchema);
export default Auction;
