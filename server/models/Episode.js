import mongoose from 'mongoose';

const EpisodeSchema = new mongoose.Schema({
  show: { type: mongoose.Schema.Types.ObjectId, ref: 'PodcastShow', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  thumbnail: { type: String, default: '' },
  audioUrl: { type: String, required: true },
  duration: { type: Number, default: 0 },
  publishDate: { type: Date, default: Date.now },
  tags: [{ type: String }],
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('Episode', EpisodeSchema);
