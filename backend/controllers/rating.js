import mongoose from "mongoose";
import createHttpError from "http-errors";

import User from "../models/User.js";
import Rating from "../models/Rating.js";
import RepairRequest from "../models/RepairRequest.js";

export const submitRating = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { repairRequestId, score, comment } = req.body;

    // Validate repair request
    const repairRequest = await RepairRequest.findOne({
      _id: repairRequestId,
      customer: req.user._id,
      status: "completed", // Ensure repair is completed
      paymentStatus: "paid", // Optional: Ensure payment succeeded
    }).session(session);

    if (!repairRequest)
      throw createHttpError(404, "Completed repair request not found");

    if (repairRequest.worker.toString() === req.user._id.toString())
      throw createHttpError(403, "You cannot rate yourself");

    // Check if rating already exists
    const existingRating = await Rating.findOne({
      repairRequest: repairRequestId,
    }).session(session);

    if (existingRating) throw createHttpError(400, "Rating already submitted");

    // Create rating
    const rating = await Rating.create(
      [
        {
          worker: repairRequest.worker,
          customer: req.user._id,
          repairRequest: repairRequestId,
          score,
          comment,
        },
      ],
      { session }
    );

    // Update worker's average rating
    const updatedWorker = await User.findByIdAndUpdate(
      repairRequest.worker,
      {
        $inc: { "rating.count": 1, "rating.total": score },
        $set: {
          "rating.average": {
            $divide: [
              {
                $add: [
                  { $multiply: ["$rating.average", "$rating.count"] },
                  score,
                ],
              },
              { $add: ["$rating.count", 1] },
            ],
          },
        },
      },
      { new: true, session }
    );

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: "Rating submitted successfully",
      data: rating[0],
    });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};
