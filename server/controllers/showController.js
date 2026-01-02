import PodcastShow from '../models/PodcastShow.js';
import Episode from '../models/Episode.js';

export const createShow = async (req, res) => {
  try {
    const { title, description, thumbnail, category, tags } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Title required' });

    const newShow = await PodcastShow.create({
      title,
      description,
      thumbnail,
      category,
      tags: Array.isArray(tags) ? tags : (tags ? String(tags).split(',').map(t => t.trim()) : []),
      user: req.user?.userId || null,
    });

    return res.status(201).json({ success: true, message: 'Podcast show created', data: newShow });
  } catch (err) {
    console.error('createShow error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getShows = async (req, res) => {
  try {
    const { page = 1, limit = 12, search, category, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const p = Math.max(1, Number(page));
    const l = Math.min(100, Number(limit));
    const skip = (p - 1) * l;

    const filter = {};
    if (category) filter.category = category;
    if (search) {
      const term = String(search).trim();
      filter.$or = [
        { title: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } },
        { tags: { $elemMatch: { $regex: term, $options: 'i' } } },
      ];
    }

    const total = await PodcastShow.countDocuments(filter);
    const order = String(sortOrder).toLowerCase() === 'asc' ? 1 : -1;
    const data = await PodcastShow.find(filter).sort({ [sortBy]: order }).skip(skip).limit(l).lean();

    return res.json({ success: true, total, page: p, numOfPage: Math.max(1, Math.ceil(total / l)), data });
  } catch (err) {
    console.error('getShows error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getShow = async (req, res) => {
  try {
    const { id } = req.params;
    const show = await PodcastShow.findById(id).lean();
    if (!show) return res.status(404).json({ success: false, message: 'Show not found' });

    // fetch episodes for this show, newest first
    const episodes = await Episode.find({ show: id }).sort({ publishDate: -1 }).lean();
    return res.json({ success: true, data: { show, episodes } });
  } catch (err) {
    console.error('getShow error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateShow = async (req, res) => {
  try {
    const { id } = req.params;
    const update = {};
    ['title', 'description', 'thumbnail', 'category', 'tags'].forEach((f) => {
      if (typeof req.body[f] !== 'undefined') update[f] = req.body[f];
    });
    if (update.tags && !Array.isArray(update.tags)) update.tags = String(update.tags).split(',').map(t => t.trim()).filter(Boolean);

    const updated = await PodcastShow.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!updated) return res.status(404).json({ success: false, message: 'Show not found' });
    return res.json({ success: true, message: 'Show updated', data: updated });
  } catch (err) {
    console.error('updateShow error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteShow = async (req, res) => {
  try {
    const { id } = req.params;
    const show = await PodcastShow.findById(id);
    if (!show) return res.status(404).json({ success: false, message: 'Show not found' });
    // delete episodes belonging to this show
    await Episode.deleteMany({ show: id });
    await PodcastShow.findByIdAndDelete(id);
    return res.json({ success: true, message: 'Show and its episodes deleted' });
  } catch (err) {
    console.error('deleteShow error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getTrendingShows = async (req, res) => {
  try {
    // naive trending: newest shows for now
    const data = await PodcastShow.find().sort({ createdAt: -1 }).limit(8).lean();
    return res.json({ success: true, data });
  } catch (err) {
    console.error('getTrendingShows error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
