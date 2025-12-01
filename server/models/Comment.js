import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Posts", required: true },
    desc: { type: String, required: true },
  },
  { timestamps: true }
);

const Comment = mongoose.model("Comments", commentSchema);
export default Comment;