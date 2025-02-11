import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      maxlength: 500,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Worker Review
const workerReviewSchema = new mongoose.Schema({
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  repairRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RepairRequest",
    required: true,
  },
});

// Add to WorkerReview discriminator
workerReviewSchema.pre("save", async function () {
  const repair = await mongoose.model("RepairRequest").findOne({
    _id: this.repairRequest,
    customer: this.customer,
    status: RepairStatus.COMPLETED,
  });
  if (!repair) throw new Error("Cannot review incomplete repairs");
});

// Product Review
const productReviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  reservation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Reservation",
    required: true,
  },
});

const Review = mongoose.model("Review", reviewSchema);
Review.discriminator("WorkerReview", workerReviewSchema);
Review.discriminator("ProductReview", productReviewSchema);

export default Review;
