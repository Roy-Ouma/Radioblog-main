import mongoose from 'mongoose';

const episodeCommentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  episode: { type: mongoose.Schema.Types.ObjectId, ref: 'Episode', required: true },
  desc: { type: String, required: true },
}, { timestamps: true });

const EpisodeComment = mongoose.model('EpisodeComments', episodeCommentSchema);
export default EpisodeComment;
