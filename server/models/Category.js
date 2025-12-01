import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  label: { type: String, required: true, trim: true, unique: true },
  color: { type: String, default: 'bg-gray-600' },
  icon: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model('Category', categorySchema);
