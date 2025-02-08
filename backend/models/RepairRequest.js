import mongoose from "mongoose";

// Notifications
import { sendEmail } from "../services/emailService.js";
import { repairStatusEmailTemplate } from "../utils/emailTemplates.js";

const RepairRequestSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    itemType: {
      type: String,
      required: [true, "Item type is required"], // e.g., "Laptop", "Refrigerator"
    },
    issueDescription: {
      type: String,
      required: [true, "Issue description is required"],
    },
    photos: [
      {
        url: { type: String, required: true }, // Cloudinary URL
        public_id: { type: String, required: true }, // Cloudinary public ID
      },
    ],
    shippingRequired: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed"],
      default: "pending",
    },
    paymentIntentId: String,
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    paymentAmount: {
      type: Number,
      min: 0,
    },
    trackingUpdates: [
      {
        status: { type: String, required: true }, // e.g., "Received", "Diagnosing", "Shipped Back"
        location: String, // e.g., "Service Center, Cairo"
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

RepairRequestSchema.index({ worker: 1 });
RepairRequestSchema.index({ paymentIntentId: 1 });
RepairRequestSchema.index({ issueDescription: "text" });

RepairRequestSchema.pre("save", async function (next) {
  if (this.isModified("status")) {
    try {
      const customer = await User.findById(this.customer);

      // Send email only for specific status changes
      if (["in_progress", "completed"].includes(this.status)) {
        await sendEmail({
          to: customer.email,
          subject: `🔧 Repair Update: ${this.itemType}`,
          html: repairStatusEmailTemplate(
            this.itemType,
            this.status,
            this.trackingUpdates
          ),
        });
      }
    } catch (error) {
      console.error("Failed to send status email:", err);
    }
  }
  next();
});

const RepairRequest = mongoose.model("RepairRequest", RepairRequestSchema);

export default RepairRequest;
