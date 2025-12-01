import Banner from '../models/Banner.js';

export const getActiveBanners = async (req, res, next) => {
  try {
    const banners = await Banner.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();
    return res.json({ success: true, data: banners });
  } catch (err) {
    console.error('Error fetching banners', err);
    return res.status(500).json({ success: false, message: 'Unable to fetch banners' });
  }
};

export const getAllBanners = async (req, res, next) => {
  try {
    const banners = await Banner.find()
      .sort({ order: 1, createdAt: -1 })
      .lean();
    return res.json({ success: true, data: banners });
  } catch (err) {
    console.error('Error fetching banners', err);
    return res.status(500).json({ success: false, message: 'Unable to fetch banners' });
  }
};

export const createBanner = async (req, res, next) => {
  try {
    const { title, description, image, link, isActive, order } = req.body;

    if (!title || !image) {
      return res.status(400).json({ success: false, message: 'Title and image are required' });
    }

    const banner = new Banner({
      title,
      description: description || '',
      image,
      link: link || '',
      isActive: typeof isActive === 'boolean' ? isActive : true,
      order: typeof order === 'number' ? order : 0,
    });

    await banner.save();
    return res.status(201).json({ success: true, message: 'Banner created', data: banner });
  } catch (err) {
    console.error('Error creating banner', err);
    return res.status(500).json({ success: false, message: 'Unable to create banner' });
  }
};

export const updateBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, image, link, isActive, order } = req.body;

    const update = {};
    if (title) update.title = title;
    if (description !== undefined) update.description = description;
    if (image) update.image = image;
    if (link !== undefined) update.link = link;
    if (typeof isActive === 'boolean') update.isActive = isActive;
    if (typeof order === 'number') update.order = order;
    update.updatedAt = new Date();

    const banner = await Banner.findByIdAndUpdate(id, update, { new: true });
    if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });

    return res.json({ success: true, message: 'Banner updated', data: banner });
  } catch (err) {
    console.error('Error updating banner', err);
    return res.status(500).json({ success: false, message: 'Unable to update banner' });
  }
};

export const deleteBanner = async (req, res, next) => {
  try {
    const { id } = req.params;

    const banner = await Banner.findByIdAndDelete(id);
    if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });

    return res.json({ success: true, message: 'Banner deleted' });
  } catch (err) {
    console.error('Error deleting banner', err);
    return res.status(500).json({ success: false, message: 'Unable to delete banner' });
  }
};
