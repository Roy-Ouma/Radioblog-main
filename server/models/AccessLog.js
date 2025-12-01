import mongoose from 'mongoose';

const { Schema } = mongoose;

const accessLogSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  route: { type: String, required: true },
  method: { type: String, required: true },
  ip: { type: String },
  userAgent: { type: String },
  success: { type: Boolean, default: true },
  meta: { type: Schema.Types.Mixed },
}, { timestamps: true });

const AccessLog = mongoose.model('AccessLog', accessLogSchema);

export default AccessLog;
