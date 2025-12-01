import mongoose from 'mongoose';

const passwordResetSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    token: { type: String, required: true }, // hashed token
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const PasswordReset = mongoose.model('PasswordReset', passwordResetSchema);
export default PasswordReset;
