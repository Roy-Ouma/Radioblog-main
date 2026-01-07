import { createClient } from '@supabase/supabase-js';

// Expose only public (anon) keys to the browser. Set these in the client .env
// For Create React App use REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Supabase client not configured. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in .env');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export default supabase;
