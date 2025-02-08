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
    score: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 500 },
  },
  { timestamps: true }
);

const Rating = mongoose.model("Rating", RatingSchema);
export default Rating;
