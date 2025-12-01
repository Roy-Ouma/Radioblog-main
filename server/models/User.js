import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstname: { type: String, required: true, trim: true },
    lastname: { type: String, trim: true, default: "" },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    profile: { type: String, default: "" }, // URL to avatar
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);