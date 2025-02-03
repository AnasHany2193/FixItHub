import { mongoose } from "mongoose";
import { bcrypt } from "bcryptjs";

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
    default: Date.now() + 10 + 60 + 100, // 10 minutes
  },
});

otpSchema.pre("save", async function (next) {
  if (!this.isModified("code")) return next();
  this.code = await bcrypt.hash(this.code, 10);
  next();
});

otpSchema.method.validateOTP = async function (candidateCode) {
  return await bcrypt.compare(candidateCode, this.code);
};

const OTP = mongoose.model("OTP", otpSchema);
export default OTP;
