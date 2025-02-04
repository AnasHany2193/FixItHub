import User from "../models/User.js";
import { sendApprovalEmail } from "../services/emailService.js";

//
export const getWorkerApplications = async (req, res, next) => {
  try {
    const applications = await User.find({
      "workerApplication.status": "pending",
    }).select("username email workerApplication");

    res.status(200).json({ success: true, data: applications });
  } catch (err) {
    next(err);
  }
};

//
export const updateWorkerStatus = async (req, res, next) => {
  const { userId } = req.params;
  const { status } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user || user.role !== "customer") {
      throw createHttpError(404, "Worker application not found");
    }

    user.workerApplication.status = status;
    if (status === "approved") {
      user.role = "worker";

      // Send approval email
      sendApprovalEmail(user.email, user.username);
    }

    await user.save();
    res.status(200).json({ success: true, message: `Application ${status}` });
  } catch (err) {
    next(err);
  }
};
