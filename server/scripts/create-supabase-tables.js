import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { Client } from 'pg';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SQL_PATH = path.join(__dirname, 'create_tables_supabase.sql');
const DATABASE_URL = process.env.DATABASE_URL || process.env.DIRECT_URL;

if (!DATABASE_URL) {
  console.error('Please set DATABASE_URL or DIRECT_URL in your environment (.env) before running this script.');
  process.exit(1);
}

async function connectClient(url) {
  let client;
  try {
    client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
    await client.connect();
    console.log('Connected to Postgres (relaxed TLS)');
    return client;
  } catch (err) {
    if (client) try { await client.end(); } catch (_) {}
    // fallback to strict TLS
    client = new Client({ connectionString: url });
    await client.connect();
    console.log('Connected to Postgres (strict TLS)');
    return client;
  }
}

async function run() {
  try {
    if (!fs.existsSync(SQL_PATH)) {
      console.error('SQL file not found at', SQL_PATH);
      process.exit(1);
    }

    const sql = fs.readFileSync(SQL_PATH, 'utf8');
    const client = await connectClient(DATABASE_URL);

    console.log('Applying schema... (this may take a few seconds)');
    await client.query(sql);
    console.log('\nSchema applied successfully.');

    try {
      await client.query("CREATE EXTENSION IF NOT EXISTS pgcrypto;");
      console.log('pgcrypto extension ensured.');
    } catch (err) {
      console.warn('Could not create pgcrypto extension:', err.message);
    }

    await client.end();
  } catch (err) {
    console.error('Failed to apply schema:', err.message || err);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('create-supabase-tables.js')) {
  run();
}
