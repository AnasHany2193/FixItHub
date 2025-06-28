import mongoose from "mongoose";

import User from "./User.js";

export const RepairStatus = Object.freeze({
  AWAITING_ASSIGNMENT: "awaiting_assignment",
  AUCTION_OPEN: "auction_open",
  IN_PROGRESS: "in_progress",
  AWAITING_PAYMENT: "awaiting_payment",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  RETURNING_TO_CUSTOMER: "returning_to_customer",
});

export const trackingStatusOrder = [
  "received", // 1. Item received
  "diagnosing", // 2. Diagnosis complete
  "repairing", // 3. Repair completed
  "quality_check", // 4. Quality verification passed
  "awaiting_payment", // 5. NEW: Payment required before shipping
  "payment_received", // 6. Payment confirmed
  "shipped", // 7. Item dispatched
];

const RepairRequestSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    category: {
      type: String,
      required: true,
      enum: ["electronics", "furniture", "appliances", "other"],
    },
    issueDescription: {
      type: String,
      required: true,
      trim: true,
      minlength: 20,
    },
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      validate: {
        validator: async function (v) {
          if (!v) return true;
          const user = await User.findById(v);
          return user?.role === "worker";
        },
        message: "Invalid worker",
      },
    },
    itemType: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    photos: {
      type: [
        {
          url: String,
          public_id: String,
        },
      ],
      validate: {
        validator: (v) => v.length <= 5,
        message: "Max 5 photos allowed", // ✅ Simplified message
      },
    },
    shippingRequired: {
      type: Boolean,
      default: false,
    },
    isRated: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: Object.values(RepairStatus),
      default: RepairStatus.AWAITING_ASSIGNMENT,
    },
    paymentIntentId: String,
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentAmount: {
      type: Number,
      min: 0,
      required: function () {
        return this.paymentStatus !== "pending";
      },
    },
    trackingUpdates: [
      {
        status: {
          type: String,
          required: true,
          enum: trackingStatusOrder,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    offers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Offer",
      },
    ],
    auction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auction",
    },
  },
  {
    timestamps: true,
  }
);

const RepairRequest = mongoose.model("RepairRequest", RepairRequestSchema);
export default RepairRequest;
