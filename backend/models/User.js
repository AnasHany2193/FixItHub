// Define the User schema (username, email, password).
import mongoose from "mongoose";
import bcrypt from "bcrypt";

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
      required: true,
      lowercase: true,
      unique: true, // Ensures email is unique
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address."], // Email format validation blabla@bla.bla
    },
    password: {
      type: String,
      required: true,
      minlength: 6, // Set a minimum length for security
    },
    role: {
      type: String,
      enum: ["customer", "worker", "admin"], // Roles allowed
      default: "customer", // Default role is "customer
      required: true,
    },
    profile: {
      phone: String,
      avatar: {
        type: String,
        default:
          "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541",
      },
      address: {
        street: String,
        city: String,
        zip: String,
      },
    },
    lastLogin: Date,
    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },
    // Customer-specific
    paymentMethods: [
      {
        type: { enum: ["card", "paypal"] },
        details: mongoose.Schema.Types.Mixed,
      },
    ],
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
  const salt = await bcrypt.genSalt(10); // Generate salt
  this.password = await bcrypt.hash(this.password, salt); // Hash the password
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password); // Compare the input password with the hashed password
};

const User = mongoose.model("User", userSchema);
export default User;
