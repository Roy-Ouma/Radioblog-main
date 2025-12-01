import mongoose, {Schema} from "mongoose";

const postSchema = new mongoose.Schema(
    {
        title: {type: String, required: true},
        slug: {type: String, unique: true},
        desc: {type: String, },
        img: {type: String,},
        cat: {type: String,},
        views: [{type: Schema.Types.ObjectId, ref: "Views"}],
        user: {type: Schema.Types.ObjectId, ref: "User"},
        comments: [{type: Schema.Types.ObjectId, ref: "Comments"}],
        status: {type: Boolean, default: true},
        approved: { type: Boolean, default: false },
        approvedBy: { type: Schema.Types.ObjectId, ref: 'User', required: false },
        approvedAt: { type: Date, required: false },
    },
    {timestamps: true}
);

const Posts = mongoose.model("Posts", postSchema);

export default Posts;
     
