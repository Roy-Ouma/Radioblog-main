import Episode from '../models/Episode.js';
import PodcastShow from '../models/PodcastShow.js';

export const createEpisode = async (req, res) => {
  try {
    const { showId } = req.params;
    const { title, description, thumbnail, audioUrl, duration, publishDate, tags } = req.body;
    if (!title || !audioUrl) return res.status(400).json({ success: false, message: 'Title and audioUrl required' });

    const show = await PodcastShow.findById(showId);
    if (!show) return res.status(404).json({ success: false, message: 'Show not found' });

    const newEp = await Episode.create({
      show: showId,
      title,
      description,
      thumbnail: thumbnail || show.thumbnail || '',
      audioUrl,
      duration: Number(duration) || 0,
      publishDate: publishDate ? new Date(publishDate) : Date.now(),
      tags: Array.isArray(tags) ? tags : (tags ? String(tags).split(',').map(t => t.trim()) : []),
      user: req.user?.userId || null,
    });

    return res.status(201).json({ success: true, message: 'Episode created', data: newEp });
  } catch (err) {
    console.error('createEpisode error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getEpisode = async (req, res) => {
  try {
    const { id } = req.params;
    const ep = await Episode.findById(id).lean();
    if (!ep) return res.status(404).json({ success: false, message: 'Episode not found' });
    return res.json({ success: true, data: ep });
  } catch (err) {
    console.error('getEpisode error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const listEpisodesByShow = async (req, res) => {
  try {
    const { showId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const p = Math.max(1, Number(page));
    const l = Math.min(500, Number(limit));
    const skip = (p - 1) * l;

    const filter = { show: showId };
    const total = await Episode.countDocuments(filter);
    const data = await Episode.find(filter).sort({ publishDate: -1 }).skip(skip).limit(l).lean();

    return res.json({ success: true, total, page: p, numOfPage: Math.max(1, Math.ceil(total / l)), data });
  } catch (err) {
    console.error('listEpisodesByShow error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateEpisode = async (req, res) => {
  try {
    const { id } = req.params;
    const update = {};
    ['title', 'description', 'thumbnail', 'audioUrl', 'duration', 'publishDate', 'tags'].forEach((f) => {
      if (typeof req.body[f] !== 'undefined') update[f] = req.body[f];
    });
    if (update.tags && !Array.isArray(update.tags)) update.tags = String(update.tags).split(',').map(t => t.trim()).filter(Boolean);
    if (update.publishDate) update.publishDate = new Date(update.publishDate);

    const updated = await Episode.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!updated) return res.status(404).json({ success: false, message: 'Episode not found' });
    return res.json({ success: true, message: 'Episode updated', data: updated });
  } catch (err) {
    console.error('updateEpisode error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteEpisode = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Episode.findById(id);
    if (!existing) return res.status(404).json({ success: false, message: 'Episode not found' });
    await Episode.findByIdAndDelete(id);
    return res.json({ success: true, message: 'Episode deleted' });
  } catch (err) {
    console.error('deleteEpisode error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
