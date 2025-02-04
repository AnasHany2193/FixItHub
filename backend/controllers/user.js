import createHttpError from "http-errors";

import User from "../models/User.js";

//
export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password") // Exclude password
      .lean(); // Return plain JS object

    if (!user) {
      throw createHttpError(404, "User not found");
    }

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};
