import mongoose from "mongoose";

const engagementSessionSchema = new mongoose.Schema({
  post: { type: mongoose.Schema.Types.ObjectId, ref: "Posts", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Optional: for logged-in users
  sessionId: { type: String, required: true },
  ip: { type: String },
  userAgent: { type: String },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  totalTime: { type: Number, default: 0 }, // in seconds
  engaged: { type: Boolean, default: false },
  counted: { type: Boolean, default: false },
}, { timestamps: true });

// Index for efficient queries
engagementSessionSchema.index({ post: 1, sessionId: 1 }, { unique: true });

const EngagementSession = mongoose.model("EngagementSession", engagementSessionSchema);

export default EngagementSession;