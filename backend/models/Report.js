import mongoose from "mongoose";
import createHttpError from "http-errors";

/**
 * @typedef {Object} Report
 * @property {mongoose.Types.ObjectId} reporter - User who created the report
 * @property {'product'|'repair'|'review'|'user'} contentType - Type of content being reported
 * @property {mongoose.Types.ObjectId} contentId - Reference to reported content
 * @property {'spam'|'inappropriate'|'fraudulent'|'false_information'|'harassment'|'other'} reason - Report category
 * @property {string} [description] - Detailed explanation (max 500 chars)
 * @property {'pending'|'under_review'|'resolved'|'dismissed'} status - Current report status
 * @property {mongoose.Types.ObjectId} [resolvedBy] - Admin who handled the report
 * @property {Array<'remove_content'|'warn_user'|'ban_user'|'no_action'>} [actionsTaken] - Taken moderation actions
 * @property {string} [resolutionNotes] - Admin comments on resolution
 * @property {Date} [resolvedAt] - Timestamp of resolution
 */
const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Reporter reference is required"],
      index: true,
    },
    contentType: {
      type: String,
      required: [true, "Content type is required"],
      enum: {
        values: ["product", "repair", "review", "user"],
        message: "Invalid content type: {VALUE}",
      },
    },
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Content reference is required"],
      refPath: "contentType",
      validate: {
        validator: async function (value) {
          const modelMap = {
            product: "Product",
            repair: "RepairRequest",
            review: "Review",
            user: "User",
          };
          return mongoose
            .model(modelMap[this.contentType])
            .exists({ _id: value });
        },
        message: "Reported content does not exist",
      },
    },
    reason: {
      type: String,
      required: [true, "Report reason is required"],
      enum: {
        values: [
          "spam",
          "inappropriate",
          "fraudulent",
          "false_information",
          "harassment",
          "other",
        ],
        message: "Invalid report reason: {VALUE}",
      },
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "under_review", "resolved", "dismissed"],
      default: "pending",
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      validate: {
        validator: function (v) {
          return ["resolved", "dismissed"].includes(this.status) ? !!v : true;
        },
        message: "Resolver required for resolved/dismissed reports",
      },
    },
    actionsTaken: {
      type: [
        {
          type: String,
          enum: ["remove_content", "warn_user", "ban_user", "no_action"],
        },
      ],
      validate: {
        validator: function (v) {
          return this.status === "resolved" ? v.length > 0 : true;
        },
        message: "At least one action required for resolved reports",
      },
    },
    resolutionNotes: {
      type: String,
      required: function () {
        return this.status === "resolved";
      },
    },
    resolvedAt: {
      type: Date,
      validate: {
        validator: function (v) {
          return ["resolved", "dismissed"].includes(this.status) ? !!v : true;
        },
        message: "Resolution date required for closed reports",
      },
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Indexes for common queries
reportSchema.index({ contentType: 1, status: 1 });
reportSchema.index({ createdAt: -1 });
reportSchema.index({ contentId: 1, contentType: 1 });

/**
 * Virtual population of reported content
 */
reportSchema.virtual("content", {
  ref: function () {
    return this.contentType; // Returns the model name
  },
  localField: "contentId",
  foreignField: "_id",
  justOne: true,
});

/**
 * Pre-save validation for report closure
 */
reportSchema.pre("save", function (next) {
  if (["resolved", "dismissed"].includes(this.status)) {
    if (!this.resolvedAt) this.resolvedAt = new Date();
    if (!this.resolvedBy) {
      return next(
        createHttpError.BadRequest("Resolver user required for closed reports")
      );
    }
  }
  next();
});
const Report = mongoose.model("Report", reportSchema);
export default Report;
