import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Posts", required: true },
    desc: { type: String, required: true },
    // Reply support: optional parent comment reference
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "Comments", default: null },
    // Likes on comments
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const Comment = mongoose.model("Comments", commentSchema);
export default Comment;