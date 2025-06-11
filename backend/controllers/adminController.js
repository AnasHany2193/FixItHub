import User from "../models/User.js";
import createHttpError from "http-errors";

// [GET] /admin/users?role=worker
export const getUsersByRole = async (req, res, next) => {
  const { role } = req.query;

  try {
    const validRoles = ["customer", "worker"];
    const filter = validRoles.includes(role)
      ? { role }
      : { role: { $in: validRoles } }; // Excludes admin

    const users = await User.find(filter);

    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

// [GET] /admin/users/:id
export const getUserDetails = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return next(createHttpError(404, "User not found"));

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// [PATCH] /admin/users/:id/status
export const updateUserStatus = async (req, res, next) => {
  const { status } = req.body;
  if (!["active", "banned"].includes(status))
    return next(createHttpError(400, "Invalid status"));

  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(createHttpError(404, "User not found"));

    user.status = status;
    if (status === "banned") user.bannedAt = new Date();
    else user.bannedAt = null;

    // Log the admin action
    user.adminLogs.push({
      action: "Update Status",
      targetUser: user._id,
      details: { status },
    });

    await user.save();

    res.json({ success: true, message: `User ${status}` });
  } catch (err) {
    next(err);
  }
};

// [PATCH] /admin/users/:id/worker-approval
export const approveOrRejectWorker = async (req, res, next) => {
  const { status } = req.body;
  if (!["approved", "rejected"].includes(status))
    return next(createHttpError(400, "Invalid approval status"));

  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== "worker")
      return next(createHttpError(404, "Worker not found"));

    user.workerApplication.status = status;

    // Log the admin action
    user.adminLogs.push({
      action: "Worker Approval",
      targetUser: user._id,
      details: { newStatus: status },
    });

    await user.save();

    res.json({ success: true, message: `Worker ${status}` });
  } catch (err) {
    next(err);
  }
};

// [GET] /admin/logs
export const getAdminLogs = async (req, res, next) => {
  try {
    const logs = await User.aggregate([
      { $unwind: "$adminLogs" },
      {
        $project: {
          _id: 0,
          action: "$adminLogs.action",
          targetUser: "$adminLogs.targetUser",
          details: "$adminLogs.details",
          timestamp: "$adminLogs.timestamp",
        },
      },
      { $sort: { timestamp: -1 } },
    ]);

    res.json({ success: true, data: logs });
  } catch (err) {
    next(err);
  }
};
