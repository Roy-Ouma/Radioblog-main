#!/usr/bin/env node
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/UserModel.js';

dotenv.config({ path: new URL('../.env', import.meta.url) });

const uri = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.MONGODB_URL;
if (!uri) {
  console.error('No Mongo URI found in environment (MONGO_URI / MONGODB_URI / MONGODB_URL)');
  process.exit(1);
}

const email = process.argv[2];
if (!email) {
  console.error('Usage: node scripts/promoteAdmin.js <email>');
  process.exit(1);
}

const run = async () => {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    const user = await User.findOne({ email });
    if (!user) {
      console.error('User not found:', email);
      process.exit(2);
    }
    user.accountType = 'Admin';
    user.isGeneralAdmin = true;
    await user.save();
    console.log('Promoted user to General Admin:', email);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(3);
  }
};

run();
