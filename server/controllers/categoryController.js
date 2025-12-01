import Category from '../models/Category.js';

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ label: 1 }).lean();
    return res.json({ success: true, data: categories });
  } catch (err) {
    console.error('GET /categories error', err);
    return res.status(500).json({ success: false, message: 'Unable to fetch categories' });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { label, color, icon } = req.body;
    if (!label) return res.status(400).json({ success: false, message: 'Label is required' });

    const existing = await Category.findOne({ label: label.trim() });
    if (existing) return res.status(409).json({ success: false, message: 'Category already exists' });

    const cat = new Category({ label: label.trim(), color: color || 'bg-gray-600', icon: icon || '' });
    await cat.save();
    return res.json({ success: true, message: 'Category created', data: cat });
  } catch (err) {
    console.error('CREATE /categories error', err);
    return res.status(500).json({ success: false, message: 'Unable to create category' });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { label, color, icon } = req.body;
    if (!id) return res.status(400).json({ success: false, message: 'Missing category id' });

    const updated = await Category.findByIdAndUpdate(
      id,
      { $set: { label: label?.trim?.() || undefined, color, icon, updatedAt: new Date() } },
      { new: true }
    );

    if (!updated) return res.status(404).json({ success: false, message: 'Category not found' });
    return res.json({ success: true, message: 'Category updated', data: updated });
  } catch (err) {
    console.error('UPDATE /categories/:id error', err);
    return res.status(500).json({ success: false, message: 'Unable to update category' });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: 'Missing category id' });

    const deleted = await Category.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Category not found' });

    return res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    console.error('DELETE /categories/:id error', err);
    return res.status(500).json({ success: false, message: 'Unable to delete category' });
  }
};
