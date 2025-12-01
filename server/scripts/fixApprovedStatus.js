/*
 One-time script: set `status: true` for posts that are already approved but not published.
 Usage (from project root):
   node server/scripts/fixApprovedStatus.js
 Requires environment variable MONGO_URL set (same as server uses).
*/
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Posts from '../models/Posts.js';

// Try to load .env from project root
dotenv.config({ path: process.cwd() + '/.env' });

const MONGO_URL = process.env.MONGO_URL || process.env.DATABASE_URL;

if (!MONGO_URL) {
  console.error('MONGO_URL environment variable is not set. Aborting.');
  process.exit(1);
}

async function run() {
  try {
    await mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    const filter = { approved: true, $or: [{ status: { $exists: false } }, { status: false }] };
    const update = { $set: { status: true } };

    const res = await Posts.updateMany(filter, update);
    console.log(`Matched ${res.matchedCount}, modified ${res.modifiedCount} documents.`);

    await mongoose.disconnect();
    console.log('Disconnected. Done.');
    process.exit(0);
  } catch (err) {
    console.error('Error running migration:', err);
    process.exit(1);
  }
}

run();
