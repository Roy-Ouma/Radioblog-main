import mongoose from "mongoose";

const verificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Verification = mongoose.model("Verification", verificationSchema);
export default Verification;