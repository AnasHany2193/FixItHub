import mongoose from "mongoose";

import Reservation from "./Reservation.js";

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    type: {
      type: String,
      required: true,
      enum: ["product", "spare_part"],
      default: "product",
    },
    category: {
      type: String,
      required: true,
      enum: ["electronics", "furniture", "appliances", "other"],
    },
    condition: {
      type: String,
      required: true,
      enum: ["new", "refurbished", "used"],
    },
    price: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"],
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
    stock: {
      type: Number,
      required: true,
      min: [0, "Stock cannot be negative"],
    },
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    repairRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RepairRequest",
    },
    reservedStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["active", "archived"],
      default: "active",
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: function () {
          return this.coordinates?.length;
        },
      },
      coordinates: {
        type: [Number],
        required: function () {
          return this.type === "Point";
        },
        validate: {
          validator: (v) =>
            v.length === 2 &&
            v[0] >= -180 &&
            v[0] <= 180 &&
            v[1] >= -90 &&
            v[1] <= 90,
          message: "Invalid coordinates",
        },
      },
    },
  },
  { timestamps: true }
);

productSchema.index({ price: 1 });
productSchema.index({ worker: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ location: "2dsphere" });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ title: "text", description: "text" });

productSchema.pre("deleteOne", async function () {
  try {
    await Reservation.deleteMany({ product: this.getQuery()._id });
  } catch (error) {
    console.error("Failed to delete reservations:", error);
    throw error;
  }
});

productSchema.virtual("availableStock").get(function () {
  return this.stock - this.reservedStock;
});

const Product = mongoose.model("Product", productSchema);
export default Product;
