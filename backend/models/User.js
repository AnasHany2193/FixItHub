import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import validator from "validator";

import cloudinary from "../config/cloudinary.js";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true, // Ensures username is unique
      minlength: 3,
      maxlength: 30,
      lowercase: true,
    },
    email: {
      type: String,
      unique: true, // Ensures email is unique
      lowercase: true,
      required: [true, "Email is required"],
      validate: [validator.isEmail, "Invalid email format"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    role: {
      type: String,
      required: true,
      enum: ["customer", "worker", "admin"],
      default: "customer", // Default role is "customer"
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
          default:
            "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541",
        },
        public_id: String,
      },
      phone: String,
      address: {
        street: String,
        city: String,
        state: String,
        zip: String,
        country: String,
      },
      bio: { type: String, maxlength: 500 },
      socialMedia: {
        website: String,
        linkedin: String,
        twitter: String,
      },
    },
    tokenVersion: {
      type: Number,
      default: 0,
    },
    // Worker-specific
    workerApplication: {
      skills: { type: [String], default: [] },
      certifications: { type: [String], default: [] },
      experience: String,
      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
      },
      documents: [
        {
          url: String,
          public_id: String,
        },
      ],
      workHistory: [
        {
          position: String,
          company: String,
          startYear: Number,
          endYear: Number,
        },
      ],
      availability: {
        type: String,
        enum: ["full-time", "part-time", "unavailable"],
      },
    },
    stats: {
      completedRepairs: { type: Number, default: 0 },
      completedSales: { type: Number, default: 0 },
      responseRate: { type: Number, default: 0 },
    },
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
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
      },
    },
    adminLogs: [
      {
        action: String,
        targetUser: mongoose.Schema.Types.ObjectId,
        details: mongoose.Schema.Types.Mixed,
        timestamp: { type: Date, default: Date.now },
      },
    ],
    warnings: [
      {
        date: Date,
        reason: String,
        contentType: String,
        contentId: mongoose.Schema.Types.ObjectId,
      },
    ],
    banReason: String,
    bannedAt: Date,
  },
  { timestamps: true } // Automatically adds `createdAt` and `updatedAt`
);

userSchema.index({ location: "2dsphere" });

// Hash the password before saving the user
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // Skip if password is not modified
  this.password = await bcrypt.hash(this.password, 10); // Hash the password
  next();
});

userSchema.post("findOneAndUpdate", async function (doc) {
  try {
    if (
      doc.workerApplication?.status === "rejected" &&
      doc.workerApplication.documents?.length
    ) {
      const publicIds = doc.workerApplication.documents
        .filter((doc) => doc.public_id)
        .map((doc) => doc.public_id);

      if (publicIds.length) await cloudinary.api.delete_resources(publicIds);
    }
  } catch (error) {
    console.error("Document cleanup failed:", error);
  }
});

// Method to compare password
userSchema.methods.validatePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password); // Compare the input password with the hashed password
};

userSchema.methods.incrementTokenVersion = function () {
  this.tokenVersion += 1;
  return this.save();
};

userSchema.methods.isApprovedWorker = function () {
  return (
    this.role === "worker" && this.workerApplication?.status === "approved"
  );
};

const User = mongoose.model("User", userSchema);
export default User;
