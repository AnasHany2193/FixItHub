import { mongoose } from "mongoose";
import bcrypt from "bcryptjs";

const otpSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID is required"],
    index: true,
  },
  code: {
    type: String,
    required: [true, "OTP code is required"],
    minlength: [6, "OTP must be 6 characters"],
    maxlength: [6, "OTP must be 6 characters"],
  },
  expiresAt: {
    type: Date,
    default: () => Date.now() + 10 * 60 * 1000, // 10 minutes
    index: { expires: 0 }, // TTL index
  },
  type: {
    type: String,
    enum: {
      values: ["verification", "passwordReset"],
      message: "Invalid OTP type",
    },
    default: "verification",
  },
  attempts: {
    type: Number,
    default: 0,
    max: [3, "Maximum OTP attempts exceeded"],
  },
});

// Security: Hash OTP code
otpSchema.pre("save", async function (next) {
  if (!this.isModified("code")) return next();

  try {
    const salt = await bcrypt.genSalt(8);
    this.code = await bcrypt.hash(this.code, salt);
    next();
  } catch (error) {
    next(createHttpError.InternalServerError("OTP hashing failed"));
  }
});

// Instance methods
otpSchema.methods = {
  validateOTP: async function (candidateCode) {
    try {
      if (this.attempts >= 3)
        throw createHttpError.TooManyRequests("OTP attempts exceeded");

      const isValid = await bcrypt.compare(candidateCode, this.code);
      if (!isValid) {
        this.attempts += 1;
        await this.save();
      }

      return isValid;
    } catch (error) {
      throw createHttpError.InternalServerError("OTP validation failed");
    }
  },

  invalidate: async function () {
    this.expiresAt = Date.now();
    return this.save();
  },
};

const OTP = mongoose.model("OTP", otpSchema);
export default OTP;
