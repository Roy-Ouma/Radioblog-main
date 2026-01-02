import mongoose from 'mongoose';

const PodcastShowSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  thumbnail: { type: String, default: '' },
  category: { type: String },
  tags: [{ type: String }],
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('PodcastShow', PodcastShowSchema);
