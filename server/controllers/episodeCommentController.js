import EpisodeComment from '../models/EpisodeComment.js';
import Episode from '../models/Episode.js';

export const getEpisodeComments = async (req, res) => {
  try {
    const { episodeId } = req.params;
    const comments = await EpisodeComment.find({ episode: episodeId }).sort({ createdAt: -1 }).populate({ path: 'user', select: 'name image' }).lean();
    return res.json({ success: true, data: comments });
  } catch (err) {
    console.error('getEpisodeComments error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const postEpisodeComment = async (req, res) => {
  try {
    const { episodeId } = req.params;
    const { desc } = req.body;
    if (!desc) return res.status(400).json({ success: false, message: 'Comment text required' });

    const episode = await Episode.findById(episodeId);
    if (!episode) return res.status(404).json({ success: false, message: 'Episode not found' });

    const newComment = await EpisodeComment.create({ user: req.user.userId, episode: episodeId, desc });
    const populated = await EpisodeComment.findById(newComment._id).populate({ path: 'user', select: 'name image' }).lean();
    return res.status(201).json({ success: true, data: populated });
  } catch (err) {
    console.error('postEpisodeComment error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
