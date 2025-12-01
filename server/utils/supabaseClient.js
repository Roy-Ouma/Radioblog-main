import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load server/.env explicitly (handles running from repo root)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(process.cwd(), 'server', '.env');
dotenv.config({ path: envPath });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

let supabase = null;
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.warn('Supabase not fully configured (SUPABASE_URL or SUPABASE_SERVICE_KEY missing) — Supabase client disabled');
} else {
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false },
  });
}

export { supabase };
