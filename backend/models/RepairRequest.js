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

RepairRequestSchema.index({ issueDescription: "text" });

RepairRequestSchema.pre("save", async function (next) {
  if (this.isModified("status")) {
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
  }
  next();
});

const RepairRequest = mongoose.model("RepairRequest", RepairRequestSchema);

export default RepairRequest;
