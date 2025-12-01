import mongoose from "mongoose";

const { Schema } = mongoose;

const followersSchema = new Schema(
  {
    followerId: { type: Schema.Types.ObjectId, ref: "User" },
    writerId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Followers = mongoose.model("Followers", followersSchema);

export default Followers;