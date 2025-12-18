import mongoose from 'mongoose';

const PodcastSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  thumbnail: { type: String, default: '' },
  audioUrl: { type: String, required: true },
  duration: { type: Number, default: 0 }, // seconds
  tags: [{ type: String }],
  category: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('Podcast', PodcastSchema);
