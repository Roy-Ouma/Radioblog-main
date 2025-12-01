import mongoose from 'mongoose';

const ShareShortLinkSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true, index: true },
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Posts', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
  createdAt: { type: Date, default: () => new Date() },
  expiresAt: { type: Date },
  clicks: { type: Number, default: 0 }
});

export default mongoose.model('ShareShortLink', ShareShortLinkSchema);
