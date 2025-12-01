import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const OUTPUT = path.join(process.cwd(), 'scripts', 'output');
if (!fs.existsSync(OUTPUT)) fs.mkdirSync(OUTPUT, { recursive: true });

const MONGODB_URL = process.env.MONGODB_URL;
if (!MONGODB_URL) {
  console.error('MONGODB_URL is required in your environment');
  process.exit(1);
}

(async function main(){
  await mongoose.connect(MONGODB_URL, { dbName: undefined });
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db;
  const cols = await db.listCollections().toArray();
  const names = cols.map(c => c.name);
  console.log('Collections found:', names.join(', '));

  for (const name of names) {
    try {
      const docs = await db.collection(name).find({}).toArray();
      const outFile = path.join(OUTPUT, `${name}.json`);
      fs.writeFileSync(outFile, JSON.stringify(docs, null, 2), 'utf8');
      console.log(`Exported ${docs.length} documents from ${name} -> ${outFile}`);
    } catch (err) {
      console.error('Failed to export collection', name, err.message || err);
    }
  }

  console.log('Export complete. Review files in', OUTPUT);
  mongoose.disconnect();
})();
