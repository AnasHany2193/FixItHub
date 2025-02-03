import bcrypt from "bcrypt";
import mongoose from "mongoose";
import validator from "validator";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true, // Ensures username is unique
      minlength: 3,
      maxlength: 30,
      required: true,
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
    // Worker-specific
    workerApplication: {
      skills: [String],
      certifications: [String],
      experience: String,
      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
      },
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
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

// Method to compare password
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password); // Compare the input password with the hashed password
};

const User = mongoose.model("User", userSchema);
export default User;
