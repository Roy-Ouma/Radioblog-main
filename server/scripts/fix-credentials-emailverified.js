import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/UserModel.js';

dotenv.config({ path: 'server/.env' });

async function main() {
  const MONGODB_URL = process.env.MONGODB_URL;
  if (!MONGODB_URL) {
    console.error('MONGODB_URL missing in server/.env');
    process.exit(1);
  }
  await mongoose.connect(MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');

  // Find credentials users with emailVerified = true
  const filter = { provider: 'credentials', emailVerified: true };
  const count = await User.countDocuments(filter);
  console.log(`Found ${count} credential-based users with emailVerified=true`);
  if (count === 0) {
    await mongoose.disconnect();
    return;
  }

  // Confirm
  console.log('Updating records to set emailVerified=false...');
  const res = await User.updateMany(filter, { $set: { emailVerified: false } });
  console.log('Update result:', res.nModified || res.modifiedCount || res);
  await mongoose.disconnect();
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('fix-credentials-emailverified.js')) {
  main().catch(err => { console.error(err); process.exit(1); });
}
