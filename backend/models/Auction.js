import mongoose from "mongoose";

const AuctionSchema = new mongoose.Schema(
  {
    repairRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RepairRequest",
      required: true,
      unique: true, // One auction per repair request
    },
    bids: [
      {
        worker: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        price: { type: Number, required: true },
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

const Auction = mongoose.model("Auction", AuctionSchema);
export default Auction;
