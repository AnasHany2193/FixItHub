// models/Product.js
import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: 1000,
    },
    price: {
      type: Number,
      required: true,
      min: [0.99, "Price must be at least $0.99"],
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    stock: {
      type: Number,
      default: 1,
      min: [0, "Stock cannot be negative"],
    },
    category: {
      type: String,
      required: true,
      enum: ["electronics", "furniture", "appliances", "other"],
      index: true,
    },
    specs: [
      {
        name: {
          type: String,
          trim: true,
          maxlength: 30,
        },
        value: {
          type: String,
          trim: true,
          maxlength: 50,
        },
      },
    ],
    images: [
      {
        url: String,
        public_id: String,
      },
    ],
    avgRating: {
      type: Number,
      default: 2.5,
      min: [0, "Rating cannot be lower than 0"],
      max: [5, "Rating cannot exceed 5"],
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    favoritesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    purchasesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

ProductSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "product",
});

ProductSchema.methods.updateRating = async function () {
  const agg = await this.model("Review").aggregate([
    { $match: { product: this._id } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  this.avgRating = agg[0]?.avg || 2.5;
  this.reviewsCount = agg[0]?.count || 0;
  await this.save();
};

export default mongoose.model("Product", ProductSchema);
