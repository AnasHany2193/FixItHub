import Product from "./Product";

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: String,
  },
  { timestamps: true }
);

// Update product rating on save
reviewSchema.post("save", async function (review) {
  const product = await Product.findById(review.product);
  const reviews = await this.model("Review").find({ product: review.product });

  product.rating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  await product.save();
});

const Review = mongoose.model("Review", reviewSchema);
export default Review;
