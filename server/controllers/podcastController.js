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

// Admin: list all podcasts (with pagination)
export const adminGetPodcasts = async (req, res) => {
  try {
    const { page = 1, limit = 50, search, category } = req.query;
    const p = Math.max(1, Number(page));
    const l = Math.min(500, Number(limit));
    const skip = (p - 1) * l;

    const filter = {};
    if (category) filter.category = category;
    if (search) {
      const term = String(search).trim();
      // search title, description, and tags
      filter.$or = [
        { title: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } },
        { tags: { $elemMatch: { $regex: term, $options: 'i' } } },
      ];
    }

    const total = await Podcast.countDocuments(filter);

    // Sorting: support sortBy and sortOrder for admin listing
    // Allowed fields to sort by to avoid arbitrary field injection
    const allowedSort = ['createdAt', 'title', 'duration', 'category'];
    const sortBy = req.query.sortBy && allowedSort.includes(req.query.sortBy) ? req.query.sortBy : 'createdAt';
    const sortOrder = String(req.query.sortOrder || 'desc').toLowerCase() === 'asc' ? 1 : -1;
    const sortObj = { [sortBy]: sortOrder };

    const data = await Podcast.find(filter).sort(sortObj).skip(skip).limit(l).lean();

    return res.json({ success: true, total, page: p, numOfPage: Math.max(1, Math.ceil(total / l)), data });
  } catch (err) {
    console.error('adminGetPodcasts error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updatePodcast = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: 'Missing podcast id' });

    const update = {};
    const fields = ['title', 'description', 'thumbnail', 'audioUrl', 'duration', 'tags', 'category'];
    fields.forEach((f) => {
      if (typeof req.body[f] !== 'undefined') update[f] = req.body[f];
    });

    if (update.tags && !Array.isArray(update.tags)) {
      update.tags = String(update.tags).split(',').map((t) => t.trim()).filter(Boolean);
    }

    const updated = await Podcast.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!updated) return res.status(404).json({ success: false, message: 'Podcast not found' });
    return res.json({ success: true, message: 'Podcast updated', data: updated });
  } catch (err) {
    console.error('updatePodcast error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const deletePodcast = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: 'Missing podcast id' });

    const existing = await Podcast.findById(id);
    if (!existing) return res.status(404).json({ success: false, message: 'Podcast not found' });

    await Podcast.findByIdAndDelete(id);
    return res.json({ success: true, message: 'Podcast deleted' });
  } catch (err) {
    console.error('deletePodcast error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
