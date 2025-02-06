import { mongoose } from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
      minlength: 3,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },
    category: {
      type: String,
      required: [true, "Product category is required"],
      enum: ["electronics", "furniture", "vehicles", "appliances", "other"],
    },
    condition: {
      type: String,
      required: true,
      default: "used",
      enum: ["new", "used", "refurbished"],
    },
    images: [
      {
        url: String, // Cloudinary image URL
        public_id: String, // Used for deletion from Cloudinary
      },
    ],
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    location: {
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number], // [longitude, latitude]
      address: String,
    },
    status: {
      type: String,
      enum: ["available", "sold", "pending"],
      default: "available",
    },
  },
  { timestamps: true }
);

// Geospatial index for location-based searches
productSchema.index({ price: 1 }); // For sorting by price
productSchema.index({ location: "2dsphere" });
productSchema.index({ category: 1, condition: 1 }); // Compound index
productSchema.index({ title: "text", description: "text" }); // Text search

const Product = mongoose.model("Product", productSchema);
export default Product;
