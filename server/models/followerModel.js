import mongoose from "mongoose";

const followerSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    followerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["active", "blocked"], default: "active" },
  },
  { timestamps: true }
);

const Follower = mongoose.model("Follower", followerSchema);
export default Follower;