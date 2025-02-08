import mongoose from "mongoose";

const RatingSchema = new mongoose.Schema(
  {
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    repairRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RepairRequest",
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: {
        validator: Number.isInteger,
        message: "Rating must be an integer between 1-5",
      },
    },
    comment: { type: String, maxlength: 500 },
  },
  { timestamps: true }
);

RatingSchema.index({ worker: 1, customer: 1 });
RatingSchema.index({ repairRequest: 1 }, { unique: true });

const Rating = mongoose.model("Rating", RatingSchema);
export default Rating;
