import mongoose from "mongoose";

import User from "./User.js";
import Auction from "./Auction.js";

// Notifications
import { sendEmail } from "../services/emailService.js";
import { repairStatusEmailTemplate } from "../utils/emailTemplates.js";

const statusEnum = Object.freeze({
  PENDING: "pending",
  AUCTION_OPEN: "auction_open",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
});

const RepairRequestSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    category: {
      type: String,
      required: true,
      enum: {
        values: ["electronics", "furniture", "appliances", "other"],
        message: "Invalid repair category",
      },
    },
    issueDescription: {
      type: String,
      required: [true, "Issue description is required"],
      trim: true,
      minlength: [20, "Description must be at least 20 characters"],
    },
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      validate: {
        validator: async function (v) {
          if (!v) return true;
          const user = await User.findById(v);
          return user?.role === "worker";
        },
        message: "Worker must be a valid service provider",
      },
    },
    itemType: {
      type: String,
      required: [true, "Item type is required"], // e.g., "Laptop", "Refrigerator"
      trim: true,
      maxlength: [50, "Item type cannot exceed 50 characters"],
    },
    photos: {
      type: [
        {
          url: String, // Cloudinary URL
          public_id: String, // Cloudinary public ID
        },
      ],
      validate: {
        validator: (v) => v.length <= 5,
        message: "Maximum 5 photos allowed",
      },
    },
    shippingRequired: { type: Boolean, default: false },
    status: {
      type: String,
      enum: {
        values: Object.values(statusEnum),
        message: "Invalid repair status",
      },
      default: statusEnum.PENDING,
    },
    paymentDetails: {
      intentId: {
        type: String,
        index: true,
        sparse: true,
      },
      status: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded"],
        default: "pending",
      },
      amount: {
        type: Number,
        min: [0, "Amount cannot be negative"],
        required: function () {
          return this.paymentDetails.status !== "pending";
        },
      },
    },
    trackingUpdates: [
      {
        status: {
          type: String,
          required: true,
          enum: [
            "received",
            "diagnosing",
            "repairing",
            "quality_check",
            "shipped",
          ],
        },
        location: {
          type: String,
          required: true,
          maxlength: [100, "Location cannot exceed 100 characters"],
        },
        timestamp: {
          type: Date,
          default: () => new Date(),
        },
      },
    ],

    bids: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bid",
      },
    ],
  },

  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
RepairRequestSchema.index({ createdAt: -1 });
RepairRequestSchema.index({ "paymentDetails.status": 1 });

// Virtuals
RepairRequestSchema.virtual("activeBid").get(function () {
  return this.bids.find((bid) => bid.status === "accepted");
});

// Hooks
RepairRequestSchema.post("save", async function (doc) {
  if (doc.isModified("status")) {
    try {
      const customer = await User.findById(doc.customer);
      const shouldNotify = [
        statusEnum.IN_PROGRESS,
        statusEnum.COMPLETED,
      ].includes(doc.status);

      if (shouldNotify && customer?.email) {
        await sendEmail({
          to: customer.email,
          subject: `🔧 Repair Update: ${doc.itemType}`,
          html: repairStatusEmailTemplate(
            doc.itemType,
            doc.status,
            doc.trackingUpdates
          ),
        });
      }
    } catch (error) {
      console.error("Status email failed:", error.message);
    }
  }

  if (doc.status === statusEnum.COMPLETED) {
    await Auction.findOneAndUpdate(
      { repairRequest: doc._id },
      { status: "closed" },
      { new: true }
    );

    // Auto-accept lowest bid if auction is closed
    const auction = await Auction.findOne({ repairRequest: doc._id });
    if (auction?.currentLowestBid) await auction.acceptLowestBid();
  }
});

const RepairRequest = mongoose.model("RepairRequest", RepairRequestSchema);
export { statusEnum as RepairStatus };

export default RepairRequest;
