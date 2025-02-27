import mongoose from "mongoose";

import User from "./User.js";
import Auction from "./Auction.js";
import { sendEmail } from "../services/emailService.js";
import { repairStatusEmailTemplate } from "../utils/emailTemplates.js";

/**
 * @typedef {Object} RepairStatus
 * @property {string} AWAITING_ASSIGNMENT - Initial request state without auction
 * @property {string} AUCTION_OPEN - Bidding open for workers
 * @property {string} IN_PROGRESS - Repair work started
 * @property {string} COMPLETED - Repair successfully finished
 * @property {string} CANCELLED - Request cancelled
 * @property {string} RETURNING_TO_CUSTOMER - Item in transit back
 */
export const RepairStatus = Object.freeze({
  AWAITING_ASSIGNMENT: "awaiting_assignment",
  AUCTION_OPEN: "auction_open",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  RETURNING_TO_CUSTOMER: "returning_to_customer",
});

/**
 * @typedef {Object} TrackingStatus
 * @property {string} RECEIVED - Item received at facility
 * @property {string} DIAGNOSING - Under diagnosis
 * @property {string} REPAIRING - Active repair work
 * @property {string} QUALITY_CHECK - Post-repair inspection
 * @property {string} SHIPPED - Item dispatched
 * @property {string} PAYMENT_RECEIVED - Payment confirmed
 * @property {string} PAYMENT_FAILED - Payment processing failed
 */
const trackingStatusEnum = [
  "received",
  "diagnosing",
  "repairing",
  "quality_check",
  "shipped",
  "payment_received",
  "payment_failed",
];

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
        message: "Invalid repair category: {VALUE}",
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
      required: [true, "Item type is required"],
      trim: true,
      maxlength: [50, "Item type cannot exceed 50 characters"],
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
        message: "Maximum 5 photos allowed",
      },
    },
    shippingRequired: { type: Boolean, default: false },
    status: {
      type: String,
      enum: {
        values: Object.values(RepairStatus),
        message: "Invalid repair status: {VALUE}",
      },
      default: RepairStatus.AWAITING_ASSIGNMENT,
    },
    paymentIntentId: {
      type: String,
      index: true,
      sparse: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentAmount: {
      type: Number,
      min: [0, "Amount cannot be negative"],
      required: function () {
        return this.paymentStatus !== "pending";
      },
    },
    trackingUpdates: [
      {
        status: {
          type: String,
          required: true,
          enum: trackingStatusEnum,
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
    auction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auction",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
RepairRequestSchema.index({ paymentStatus: 1 });
RepairRequestSchema.index({ status: 1, createdAt: -1 });
RepairRequestSchema.index({ "trackingUpdates.status": 1 });

/**
 * Get the currently accepted bid
 * @returns {Bid|null} Active bid document
 */
RepairRequestSchema.virtual("activeBid").get(function () {
  return this.bids.find((bid) => bid.status === "accepted");
});

/**
 * Get simplified payment information
 * @returns {Object} Payment status details
 */
RepairRequestSchema.virtual("paymentDetails").get(function () {
  return {
    status: this.paymentStatus,
    amount: this.paymentAmount,
    intentId: this.paymentIntentId,
  };
});

/**
 * Post-save hook for status change notifications and auction updates
 */
RepairRequestSchema.post("save", async function (doc) {
  try {
    // Send email notifications for status changes
    if (doc.isModified("status")) {
      const customer = await User.findById(doc.customer);
      const notifyStatuses = [RepairStatus.IN_PROGRESS, RepairStatus.COMPLETED];

      if (notifyStatuses.includes(doc.status) && customer?.email) {
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
    }

    // Close auction when payment completes
    if (doc.isModified("paymentStatus") && doc.paymentStatus === "paid") {
      const auction = await Auction.findOne({ repairRequest: doc._id });
      if (auction) {
        await Auction.findByIdAndUpdate(auction._id, { status: "closed" });
      }
    }
  } catch (error) {
    console.error("Post-save hook error:", error.message);
  }
});

/**
 * Pre-delete hook for data cleanup
 */
RepairRequestSchema.pre("deleteOne", async function () {
  await Auction.deleteOne({ repairRequest: this._id });
  await Bid.deleteMany({ repairRequest: this._id });
});

const RepairRequest = mongoose.model("RepairRequest", RepairRequestSchema);
export default RepairRequest;
