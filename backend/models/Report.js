// models/Report.js
import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    contentType: {
      type: String,
      required: true,
      enum: ["product", "repair", "review", "user"],
    },
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "contentType",
    },
    reason: {
      type: String,
      required: true,
      enum: [
        "spam",
        "inappropriate",
        "fraudulent",
        "false_information",
        "harassment",
        "other",
      ],
    },
    description: {
      type: String,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ["pending", "under_review", "resolved", "dismissed"],
      default: "pending",
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    actionsTaken: [
      {
        type: String,
        enum: ["remove_content", "warn_user", "ban_user", "no_action"],
      },
    ],
    resolutionNotes: String,
    resolvedAt: Date,
  },
  { timestamps: true }
);

const Report = mongoose.model("Report", reportSchema);
export default Report;
