import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: String,
  desc: String,
  content: String, // blog body
  img: String,
  slug: String,
  cat: String,
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comments" }],
  views: [{ type: mongoose.Schema.Types.ObjectId, ref: "Views" }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  status: { type: Boolean, default: false },
  approved: { type: Boolean, default: false },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
  featured: { type: Boolean, default: false },
  engagedViews: { type: Number, default: 0 },
  totalVisits: { type: Number, default: 0 },
  averageReadTime: { type: Number, default: 0 },
  // SEO fields
  seoTitle: { type: String, default: '' },
  seoDescription: { type: String, default: '' },
  seoKeywords: { type: [String], default: [] },
  socialImage: { type: String, default: '' },
  canonicalUrl: { type: String, default: '' },
  noIndex: { type: Boolean, default: false },
  structuredDataOverride: { type: Object, default: null },
}, { timestamps: true });

const Posts = mongoose.model("Posts", postSchema);
export default Posts;