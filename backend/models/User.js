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
    isActive: {
      type: Boolean,
      default: true,
    },
    profile: {
      avatar: {
        type: String,
        default:
          "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541",
      },
      phone: String,
      address: {
        street: String,
        city: String,
        zip: String,
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
      documents: { type: [String], default: [] },
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
  },
  { timestamps: true } // Automatically adds `createdAt` and `updatedAt`
);

// Hash the password before saving the user
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // Skip if password is not modified
  this.password = await bcrypt.hash(this.password, 10); // Hash the password
  next();
});

userSchema.post("findOneAndUpdate", async function (doc) {
  if (
    doc.workerApplication.status === "rejected" &&
    doc.workerApplication.documents?.length
  ) {
    await cloudinary.api.delete_resources(
      doc.workerApplication.documents.map((d) => d.public_id)
    );
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
