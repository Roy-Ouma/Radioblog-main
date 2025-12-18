import Podcast from '../models/Podcast.js';

export const createPodcast = async (req, res) => {
  try {
    const { title, description, thumbnail, audioUrl, duration, tags, category } = req.body;
    if (!title || !audioUrl) return res.status(400).json({ success: false, message: 'Title and audioUrl are required' });

    const newPodcast = await Podcast.create({
      title,
      description,
      thumbnail,
      audioUrl,
      duration: Number(duration) || 0,
      tags: Array.isArray(tags) ? tags : (tags ? String(tags).split(",").map(t => t.trim()) : []),
      category,
      user: req.user?.userId || null,
    });

    return res.status(201).json({ success: true, message: 'Podcast created', data: newPodcast });
  } catch (err) {
    console.error('createPodcast error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getPodcasts = async (req, res) => {
  try {
    const { page = 1, limit = 12, trending } = req.query;
    const p = Math.max(1, Number(page));
    const l = Math.min(100, Number(limit));
    const skip = (p - 1) * l;

    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.search) {
      const term = String(req.query.search).trim();
      filter.$or = [
        { title: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } },
      ];
    }

    let query = Podcast.find(filter).sort({ createdAt: -1 }).skip(skip).limit(l);

    const total = await Podcast.countDocuments(filter);
    const data = await query.exec();

    return res.json({ success: true, total, page: p, numOfPage: Math.max(1, Math.ceil(total / l)), data });
  } catch (err) {
    console.error('getPodcasts error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getPodcast = async (req, res) => {
  try {
    const { id } = req.params;
    const podcast = await Podcast.findById(id).lean();
    if (!podcast) return res.status(404).json({ success: false, message: 'Podcast not found' });
    return res.json({ success: true, data: podcast });
  } catch (err) {
    console.error('getPodcast error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
