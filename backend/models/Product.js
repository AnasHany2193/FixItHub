import mongoose from "mongoose";
import createHttpError from "http-errors";
import Reservation from "./Reservation.js";

/**
 * @typedef {Object} Product
 * @property {string} title - Product name (max 100 chars)
 * @property {string} description - Detailed description (max 1000 chars)
 * @property {'product'|'spare_part'} type - Product classification
 * @property {string} category - Main product category
 * @property {'new'|'refurbished'|'used'} condition - Item condition
 * @property {number} price - Selling price (non-negative)
 * @property {Array<Object>} photos - Product images (max 5)
 * @property {number} stock - Total available stock
 * @property {mongoose.Types.ObjectId} worker - Service provider reference
 * @property {number} reservedStock - Currently reserved items
 * @property {'active'|'archived'} status - Listing status
 * @property {Object} location - GeoJSON coordinates
 */
const productSchema = new mongoose.Schema(
  {
    // Core Product Info
    title: {
      type: String,
      required: [true, "Product title is required"],
      maxlength: [100, "Title cannot exceed 100 characters"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      maxlength: [1000, "Description cannot exceed 1000 characters"],
      trim: true,
    },

    // Classification
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

    // Pricing & Inventory
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },
    stock: {
      type: Number,
      required: [true, "Initial stock quantity is required"],
      min: [0, "Stock cannot be negative"],
    },
    reservedStock: {
      type: Number,
      default: 0,
      min: [0, "Reserved stock cannot be negative"],
    },

    // Media & Location
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
          message: "Invalid coordinates format [longitude, latitude]",
        },
      },
    },

    // Relationships
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Service provider reference is required"],
    },
    repairRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RepairRequest",
    },
    // Status & Analytics
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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for common query patterns
productSchema.index({ price: 1 }); // Price sorting
productSchema.index({ worker: 1 }); // Worker's products
productSchema.index({ createdAt: -1 }); // Newest first
productSchema.index({ location: "2dsphere" }); // Geo queries
productSchema.index({ category: 1, status: 1 }); // Category filtering
productSchema.index({ title: "text", description: "text" }); // Full-text search

/**
 * Cleanup reservations when product is deleted
 */
productSchema.pre("deleteOne", async function () {
  try {
    await Reservation.deleteMany({ product: this.getQuery()._id });
  } catch (error) {
    throw createHttpError(500, "Failed to clean up reservations", {
      details: error.message,
    });
  }
});

/**
 * Available stock calculation
 * @returns {number} Available items (total stock - reserved)
 */
productSchema.virtual("availableStock").get(function () {
  return Math.max(this.stock - this.reservedStock, 0);
});

const Product = mongoose.model("Product", productSchema);
export default Product;
