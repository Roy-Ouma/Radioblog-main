import dotenv from 'dotenv';
import { Client } from 'pg';

dotenv.config();

const direct = process.env.DIRECT_URL || process.env.DATABASE_URL;
const pooler = process.env.DATABASE_URL;

const candidates = Array.from(new Set([direct, pooler])).filter(Boolean);

if (candidates.length === 0) {
  console.error('No database URLs found in environment (DIRECT_URL or DATABASE_URL).');
  process.exit(1);
}

async function tryConnect(url, options = {}) {
  const client = new Client({ connectionString: url, ...options });
  try {
    await client.connect();
    await client.end();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err };
  }
}

(async function main() {
  console.log('Testing Postgres connection(s) — will try each URL with relaxed then strict TLS.');

  for (const url of candidates) {
    console.log('\n---');
    console.log(`URL: ${url}`);

    // First attempt: relaxed TLS (rejectUnauthorized: false) to detect TLS issues
    console.log('Attempt 1 — relaxed TLS (rejectUnauthorized: false)');
    const relaxed = await tryConnect(url, { ssl: { rejectUnauthorized: false } });
    if (relaxed.ok) {
      console.log('✓ Connected (relaxed TLS)');
      continue;
    }
    console.warn('✗ Failed (relaxed TLS):', relaxed.error && relaxed.error.message);
    if (relaxed.error && relaxed.error.stack) {
      console.log(relaxed.error.stack);
    }

    // Second attempt: strict TLS (default behavior)
    console.log('Attempt 2 — strict TLS (default)');
    const strict = await tryConnect(url);
    if (strict.ok) {
      console.log('✓ Connected (strict TLS)');
      continue;
    }
    console.warn('✗ Failed (strict TLS):', strict.error && strict.error.message);
    if (strict.error && strict.error.stack) {
      console.log(strict.error.stack);
    }
  }

  console.log('\nTest complete. Use the output above to determine whether failures are TLS-related or credential/tenant-related.');
  console.log('If you see TLS errors (self-signed certificate), try running migration with TLS relaxed only temporarily or configure your system to trust the CA.');
  console.log('If you see "Tenant or user not found" or authentication errors, verify the exact connection string and password in the Supabase dashboard.');
  console.log('\nTo run:');
  console.log('  node scripts/test-pg-connection.js');

  process.exit(0);
})();
