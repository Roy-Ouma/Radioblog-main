import mongoose from "mongoose";

const viewsSchema = new mongoose.Schema({
    user: {type: Schema.Types.ObjectId, ref: "User", },
    post: {type: Schema.Types.ObjectId, ref: "Posts", }, 
}, {timestamps: true});

const Views = mongoose.model("Views", viewsSchema);

export default Views;