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
      status: "completed",
    }).session(session);

    if (!repairRequest)
      throw createHttpError(404, "Completed repair request not found");

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
    const worker = await User.findById(repairRequest.worker).session(session);
    const newTotal = worker.rating.average * worker.rating.count + score;
    worker.rating.count += 1;
    worker.rating.average = newTotal / worker.rating.count;
    await worker.save({ session });

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
