import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import validator from "validator";
import createHttpError from "http-errors";

// Sub-schemas for better organization
const addressSchema = new mongoose.Schema(
  {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true, maxlength: 2 },
    zip: {
      type: String,
      validate: [validator.isPostalCode, "Invalid ZIP code"],
    },
    country: { type: String, default: "US" },
  },
  { _id: false }
);

const socialMediaSchema = new mongoose.Schema(
  {
    website: { type: String, validate: [validator.isURL, "Invalid URL"] },
    linkedin: {
      type: String,
      validate: [validator.isURL, "Invalid LinkedIn URL"],
    },
    twitter: {
      type: String,
      validate: [validator.isURL, "Invalid Twitter URL"],
    },
  },
  { _id: false }
);

const workHistorySchema = new mongoose.Schema(
  {
    position: String,
    company: String,
    startYear: { type: Number, min: 1900, max: new Date().getFullYear() },
    endYear: { type: Number, min: 1900, max: new Date().getFullYear() },
  },
  { _id: false }
);

const documentSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    public_id: { type: String, required: true },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true, // Ensures username is unique
      minlength: 3,
      maxlength: 30,
      lowercase: true,
      validate: {
        validator: (v) => /^[a-z0-9_]+$/.test(v),
        message:
          "Username can only contain lowercase letters, numbers, and underscores",
      },
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      required: [true, "Email is required"],
      validate: {
        validator: validator.isEmail,
        message: "Invalid email format",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
      validate: {
        validator: (v) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(v),
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      },
    },
    role: {
      type: String,
      required: true,
      enum: ["customer", "worker", "admin"],
      default: "customer",
    },
    lastLogin: Date,
    isVerified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["active", "banned", "pending", "deactivated"],
      default: "active",
    },
    profile: {
      avatar: {
        url: {
          type: String,
          default: "/uploads/defaults/avatar.png",
          validate: [validator.isURL, "Invalid avatar URL"],
        },
        public_id: String,
      },
      phone: {
        type: String,
        validate: {
          validator: (v) => validator.isMobilePhone(v, "any"),
          message: "Invalid phone number",
        },
      },
      address: addressSchema,
      bio: {
        type: String,
        maxlength: 500,
        validate: {
          validator: (v) => !/<[^>]*>/g.test(v),
          message: "Bio cannot contain HTML tags",
        },
      },
      socialMedia: socialMediaSchema,
    },
    tokenVersion: {
      type: Number,
      default: 0,
    },
    // Worker-specific
    workerApplication: {
      skills: {
        type: [String],
        validate: {
          validator: (v) => v.length <= 10,
          message: "Maximum 10 skills allowed",
        },
      },
      certifications: {
        type: [String],
        validate: {
          validator: (v) => v.length <= 5,
          message: "Maximum 5 certifications allowed",
        },
      },
      experience: {
        type: String,
        enum: ["beginner", "intermediate", "expert"],
        default: "beginner",
      },
      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
      },
      documents: {
        type: [documentSchema],
        validate: {
          validator: (v) => v.length <= 5,
          message: "Maximum 5 documents allowed",
        },
      },
      workHistory: {
        type: [workHistorySchema],
        validate: {
          validator: (v) => v.length <= 10,
          message: "Maximum 10 work history entries allowed",
        },
      },
      availability: {
        type: String,
        enum: ["full-time", "part-time", "unavailable"],
      },
    },
    stats: {
      completedRepairs: {
        type: Number,
        default: 0,
        min: 0,
      },
      completedSales: {
        type: Number,
        default: 0,
        min: 0,
      },
      responseRate: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
    },
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
        set: (v) => parseFloat(v.toFixed(1)),
      },
      count: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: false,
      },
      coordinates: {
        type: [Number],
        required: false,
        validate: {
          validator: (v) => {
            if (!v) return true;
            return (
              v.length === 2 &&
              v[0] >= -180 &&
              v[0] <= 180 &&
              v[1] >= -90 &&
              v[1] <= 90
            );
          },
          message: "Invalid coordinates",
        },
      },
    },
    adminLogs: [
      {
        action: String,
        targetUser: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        details: mongoose.Schema.Types.Mixed,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    warnings: [
      {
        date: {
          type: Date,
          default: Date.now,
        },
        reason: String,
        contentType: {
          type: String,
          enum: ["post", "comment", "review"],
        },
        contentId: mongoose.Schema.Types.ObjectId,
      },
    ],
    banReason: String,
    bannedAt: Date,
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Indexes
userSchema.index({ location: "2dsphere" });
userSchema.index({ "profile.phone": 1 }, { unique: true, sparse: true });

// Password hashing middleware
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(createHttpError.InternalServerError("Password hashing failed"));
  }
});

// Instance methods
userSchema.methods = {
  validatePassword: async function (candidatePassword) {
    try {
      return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
      throw createHttpError.InternalServerError("Password comparison failed");
    }
  },

  incrementTokenVersion: async function () {
    this.tokenVersion += 1;
    return this.save({ validateBeforeSave: false });
  },

  isApprovedWorker: function () {
    return (
      this.role === "worker" && this.workerApplication?.status === "approved"
    );
  },
};

// Virtuals
userSchema.virtual("profile.fullAddress").get(function () {
  return `${this.profile.address?.street}, ${this.profile.address?.city}, ${this.profile.address?.state} ${this.profile.address?.zip}`;
});

const User = mongoose.model("User", userSchema);
export default User;
