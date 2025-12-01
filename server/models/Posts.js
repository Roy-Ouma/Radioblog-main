import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String },
    desc: { type: String },
    img: { type: String },
    slug: { type: String },
    cat: { type: String },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comments" }],
    views: [{ type: mongoose.Schema.Types.ObjectId, ref: "Views" }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    status: { type: Boolean, default: false },
    // moderation fields
    approved: { type: Boolean, default: false },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    approvedAt: { type: Date, required: false },
  },
  { timestamps: true }
);

const Posts = mongoose.model("Posts", postSchema);
export default Posts;