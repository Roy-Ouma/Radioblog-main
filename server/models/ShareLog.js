import mongoose from 'mongoose';

const shareSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Posts', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    platform: { type: String }, // e.g., twitter, facebook, whatsapp, copy, native
    method: { type: String }, // e.g., button, contextmenu
    ip: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

const ShareLog = mongoose.model('ShareLog', shareSchema);
export default ShareLog;
