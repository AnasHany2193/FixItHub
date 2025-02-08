import mongoose from "mongoose";

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

const RepairRequest = mongoose.model("RepairRequest", RepairRequestSchema);

export default RepairRequest;
