import mongoose from 'mongoose';
import EngagementSession from '../models/EngagementSession.js';
import dotenv from 'dotenv';

dotenv.config();

const migrateEngagementSessions = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get total count
    const totalSessions = await EngagementSession.countDocuments();
    console.log(`Found ${totalSessions} engagement sessions`);

    // The userId field is optional and will be added dynamically
    // No migration needed for existing documents as MongoDB handles schema changes automatically

    // However, let's add an index for better query performance
    await EngagementSession.collection.createIndex(
      { post: 1, userId: 1, counted: 1 },
      { background: true }
    );
    console.log('Added compound index for better query performance');

    // Optional: Clean up any orphaned sessions (older than 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const oldSessions = await EngagementSession.countDocuments({
      createdAt: { $lt: thirtyDaysAgo },
      engaged: false
    });

    if (oldSessions > 0) {
      await EngagementSession.deleteMany({
        createdAt: { $lt: thirtyDaysAgo },
        engaged: false
      });
      console.log(`Cleaned up ${oldSessions} old unengaged sessions`);
    }

    console.log('Migration completed successfully');

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run migration
migrateEngagementSessions();