#!/usr/bin/env node
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: new URL('../.env', import.meta.url) });

const uri = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.MONGODB_URL;
if (!uri) {
  console.error('No Mongo URI found in environment (MONGO_URI / MONGODB_URI / MONGODB_URL)');
  process.exit(1);
}

const opts = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
  serverSelectionTimeoutMS: 30000,
  maxPoolSize: 5,
  family: 4,
};

if (process.env.MONGO_TLS_ALLOW_INVALID === 'true') {
  opts.tls = true;
  opts.tlsAllowInvalidCertificates = true;
  opts.tlsAllowInvalidHostnames = true;
}

console.log('Attempting mongoose.connect with options:', opts);

mongoose.connect(uri, opts).then(() => {
  console.log('Connected to MongoDB successfully');
  return mongoose.connection.close();
}).catch((err) => {
  console.error('Connection error:');
  console.error(err && err.stack ? err.stack : err);
  process.exit(2);
});
