import mongoose from "mongoose";

const auctionSchema = new mongoose.Schema(
  {
    repairRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RepairRequest",
      required: true,
      unique: true,
    },
    startingMaxPrice: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },
    expiresAt: {
      type: Date,
      required: true,
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
  }
);

// Active auction lookup
auctionSchema.index({ status: 1, expiresAt: -1 });

const Auction = mongoose.model("Auction", auctionSchema);
export default Auction;
