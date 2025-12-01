import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET || 'uploads';
const SUPABASE_PUBLIC = (process.env.SUPABASE_PUBLIC || 'true') === 'true';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_KEY are required in your environment');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const OUTPUT = path.join(process.cwd(), 'scripts', 'output');
if (!fs.existsSync(OUTPUT)) fs.mkdirSync(OUTPUT, { recursive: true });

async function uploadFile(filePath, destName) {
  const file = fs.readFileSync(filePath);
  const { data, error } = await supabase.storage
    .from(SUPABASE_BUCKET)
    .upload(destName, file, { cacheControl: '3600', upsert: false });

  if (error) throw error;

  if (SUPABASE_PUBLIC) {
    const publicUrl = `${SUPABASE_URL.replace(/\/+$/, '')}/storage/v1/object/public/${SUPABASE_BUCKET}/${encodeURIComponent(destName)}`;
    return publicUrl;
  }

  // private bucket: create signed URL
  const { data: signed, error: signErr } = await supabase
    .storage
    .from(SUPABASE_BUCKET)
    .createSignedUrl(destName, 60 * 60 * 24 * 7); // 7 days

  if (signErr) throw signErr;
  return signed.signedUrl;
}

(async function main(){
  if (!fs.existsSync(UPLOAD_DIR)) {
    console.error('No uploads directory found at', UPLOAD_DIR);
    process.exit(1);
  }

  const files = fs.readdirSync(UPLOAD_DIR).filter(f => fs.statSync(path.join(UPLOAD_DIR, f)).isFile());
  console.log(`Found ${files.length} files to upload`);

  const mappings = [];
  for (const fileName of files) {
    try {
      const localPath = path.join(UPLOAD_DIR, fileName);
      // keep folder structure flat; prefix with uploads/ for clarity
      const destName = `uploads/${fileName}`;
      console.log('Uploading', fileName, '->', destName);
      const url = await uploadFile(localPath, destName);
      console.log('Uploaded ->', url);
      mappings.push({ file: fileName, dest: destName, url });
    } catch (err) {
      console.error('Failed to upload', fileName, err.message || err);
    }
  }

  const outPath = path.join(OUTPUT, 'file_mappings.json');
  fs.writeFileSync(outPath, JSON.stringify(mappings, null, 2), 'utf8');
  console.log('Wrote mappings to', outPath);
  console.log('Done. Review mappings and update your DB references as needed.');
})();
