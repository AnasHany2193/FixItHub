// middlewares/reportValidation.js
import createHttpError from "http-errors";

import User from "../models/User.js";
import Review from "../models/Review.js";
import Product from "../models/Product.js";
import RepairRequest from "../models/RepairRequest.js";

export const validateReport = async (req, res, next) => {
  try {
    const { contentType, contentId } = req.body;

    // Validate content existence
    let model;
    switch (contentType) {
      case "product":
        model = Product;
        break;
      case "repair":
        model = RepairRequest;
        break;
      case "review":
        model = Review;
        break;
      case "user":
        model = User;
        break;
      default:
        throw createHttpError(400, "Invalid content type");
    }

    const exists = await model.exists({ _id: contentId });
    if (!exists) throw createHttpError(404, "Content not found");

    // Prevent self-reporting for users
    if (contentType === "user" && contentId.equals(req.user._id)) {
      throw createHttpError(400, "Cannot report yourself");
    }

    next();
  } catch (error) {
    next(error);
  }
};
