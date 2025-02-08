import { mongoose } from "mongoose";
import bcrypt from "bcryptjs";

const otpSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    default: () => Date.now() + 10 * 60 * 1000, // Dynamic timestamp
  },
  type: {
    type: String,
    enum: ["verification", "passwordReset"],
    default: "verification",
  },
});

// Hash OTP before saving
otpSchema.pre("save", async function (next) {
  if (!this.isModified("code")) return next();
  this.code = await bcrypt.hash(this.code, 10);
  next();
});

// Method to validate OTP
otpSchema.methods.validateOTP = async function (candidateCode) {
  return await bcrypt.compare(candidateCode, this.code);
};

const OTP = mongoose.model("OTP", otpSchema);
export default OTP;
