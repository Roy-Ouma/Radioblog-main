import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Client } from 'pg';
import fs from 'fs';
ALTER TABLE IF NOT EXISTS comments ADD COLUMN IF NOT EXISTS uuid UUID DEFAULT gen_random_uuid();
ALTER TABLE IF NOT EXISTS followers ADD COLUMN IF NOT EXISTS uuid UUID DEFAULT gen_random_uuid();
ALTER TABLE IF NOT EXISTS views ADD COLUMN IF NOT EXISTS uuid UUID DEFAULT gen_random_uuid();
ALTER TABLE IF NOT EXISTS share_logs ADD COLUMN IF NOT EXISTS uuid UUID DEFAULT gen_random_uuid();
ALTER TABLE IF NOT EXISTS banners ADD COLUMN IF NOT EXISTS uuid UUID DEFAULT gen_random_uuid();
ALTER TABLE IF NOT EXISTS email_verifications ADD COLUMN IF NOT EXISTS uuid UUID DEFAULT gen_random_uuid();
ALTER TABLE IF NOT EXISTS access_logs ADD COLUMN IF NOT EXISTS uuid UUID DEFAULT gen_random_uuid();
`;

// Collections and their handlers (in migration order)
const collections = [
  'users',
  'categories',
  'posts',
  'comments',
  'followers',
  'views',
  'sharelogs',
  'banners',
  'emailverifications',
  'accesslogs',
];

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { dry: false, limit: null };
  for (const a of args) {
    if (a === '--dry') opts.dry = true;
    else if (a.startsWith('--limit=')) opts.limit = parseInt(a.split('=')[1], 10) || null;
  }
  return opts;
}

async function main() {
  const opts = parseArgs();
  console.log('Migration started', opts);

  try {
    // Connect to Mongo
    await mongoose.connect(MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = mongoose.connection.db;

    // Connect to Postgres
    await connectPostgres();

    console.log('Creating base tables (if missing)...');
    await pgClient.query(SQL_CREATE_TABLES);

    // Ensure pgcrypto
    try {
      await pgClient.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');
    } catch (ex) {
      console.warn('Warning: could not create pgcrypto extension:', ex.message);
    }

    // Add uuid columns (id -> uuid mapping will be created)
    import dotenv from 'dotenv';
    import mongoose from 'mongoose';
    import { Client } from 'pg';
    import fs from 'fs';
    import path from 'path';
    import { v4 as uuidv4 } from 'uuid';

    // Compact, single migration script
    dotenv.config();
    const MONGODB_URL = process.env.MONGODB_URL;
    const DIRECT_URL = process.env.DIRECT_URL || process.env.DATABASE_URL;
    const OUTPUT = path.join(process.cwd(), 'scripts', 'output');
    if (!fs.existsSync(OUTPUT)) fs.mkdirSync(OUTPUT, { recursive: true });

    if (!MONGODB_URL || !DIRECT_URL) {
      console.error('MONGODB_URL and DIRECT_URL (or DATABASE_URL) are required in .env');
      process.exit(1);
    }

    let pgClient;

    async function connectPostgres() {
      const poolerUrl = process.env.DATABASE_URL;
      const directUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
      const candidates = Array.from(new Set([directUrl, poolerUrl])).filter(Boolean);
      if (candidates.length === 0) throw new Error('No PostgreSQL connection URLs provided in environment');
      for (const url of candidates) {
        try { pgClient = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } }); await pgClient.connect(); return; }
        catch (e) { try { pgClient = new Client({ connectionString: url }); await pgClient.connect(); return; } catch (_) {} }
      }
      throw new Error('Unable to connect to PostgreSQL');
    }

    const SQL_CREATE_TABLES = `CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name VARCHAR(255));`;

    function parseArgs(){ const args = process.argv.slice(2); return { dry: args.includes('--dry'), limit: args.find(a=>a.startsWith('--limit=')) ? parseInt(args.find(a=>a.startsWith('--limit='))?.split('=')[1],10) : null }; }

    async function main(){
      const opts = parseArgs();
      await mongoose.connect(MONGODB_URL, { useNewUrlParser:true, useUnifiedTopology:true });
      const db = mongoose.connection.db;
      await connectPostgres();
      await pgClient.query(SQL_CREATE_TABLES);
      console.log('Migration ready. Run with --dry to test.');
    }

    if (require.main === module) main().catch(err=>{ console.error(err); process.exit(1); });
          await pgClient.query(query, [
            doc._id?.toString(),
            doc.title || '',
            doc.description || '',
            doc.image || '',
            doc.link || '',
            doc.isActive !== false,
            doc.order || 0,
            doc.createdAt || new Date(),
            doc.updatedAt || new Date(),
          ]);
        }
        console.log(`  banners: migrated ${docs.length} documents`);

      } else if (name === 'emailverifications') {
        const query = `
          INSERT INTO email_verifications (id, uuid, user_id, otp, expires_at, verified, created_at, updated_at)
          VALUES ($1, gen_random_uuid(), $2, $3, $4, $5, $6, $7)
          ON CONFLICT(id) DO NOTHING`;
        for (const doc of docs) {
          await pgClient.query(query, [
            doc._id?.toString(),
            doc.userId?.toString?.() || null,
            doc.otp || '',
            doc.expiresAt || new Date(),
            doc.verified || false,
            doc.createdAt || new Date(),
            doc.updatedAt || new Date(),
          ]);
        }
        console.log(`  email_verifications: migrated ${docs.length} documents`);

      } else if (name === 'accesslogs') {
        const query = `
          INSERT INTO access_logs (id, uuid, endpoint, method, status_code, response_time, ip, user_agent, created_at)
          VALUES ($1, gen_random_uuid(), $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT(id) DO NOTHING`;
        for (const doc of docs) {
          await pgClient.query(query, [
            doc._id?.toString(),
            doc.endpoint || null,
            doc.method || null,
            doc.statusCode || null,
            doc.responseTime || null,
            doc.ip || null,
            doc.userAgent || null,
            doc.createdAt || new Date(),
          ]);
        }
        console.log(`  access_logs: migrated ${docs.length} documents`);

      } else {
        console.log(`  (skip) ${name} - no handler`);
      }

      // Persist interim mapping files for auditing after each collection
      try {
        const mappings = {};
        if (idToUuid.users.size) mappings.users = Object.fromEntries(idToUuid.users);
        if (idToUuid.posts.size) mappings.posts = Object.fromEntries(idToUuid.posts);
        if (idToUuid.comments.size) mappings.comments = Object.fromEntries(idToUuid.comments);
        fs.writeFileSync(path.join(OUTPUT, `mapping_${colName}.json`), JSON.stringify(mappings, null, 2));
      } catch (err) {
        console.warn('Could not write mapping file:', err.message);
      }
    }

    console.log('\n✓ Migration completed successfully!');

  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    try { await mongoose.disconnect(); } catch (_) {}
    try { if (pgClient) await pgClient.end(); } catch (_) {}
  }
}

if (require.main === module) {
  main();
}

import { Client } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const MONGODB_URL = process.env.MONGODB_URL;
const DIRECT_URL = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!MONGODB_URL || !DIRECT_URL) {
  console.error('MONGODB_URL and DIRECT_URL (or DATABASE_URL) are required in .env');
  process.exit(1);
}

const OUTPUT = path.join(process.cwd(), 'scripts', 'output');
if (!fs.existsSync(OUTPUT)) fs.mkdirSync(OUTPUT, { recursive: true });

let pgClient;

async function connectPostgres() {
  const poolerUrl = process.env.DATABASE_URL;
  const directUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

  const candidates = Array.from(new Set([directUrl, poolerUrl])).filter(Boolean);
  if (candidates.length === 0) throw new Error('No PostgreSQL connection URLs provided in environment');

  for (const url of candidates) {
    try {
      // Try connecting with relaxed TLS first (some corporate proxies inject self-signed certs).
      // WARNING: rejectUnauthorized: false disables certificate verification and is insecure.
      pgClient = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
      await pgClient.connect();
      console.log(`Connected to PostgreSQL (${url.includes('pooler') ? 'pooler' : 'direct'}): ${url}`);
      return;
    } catch (err) {
      console.warn(`Connection attempt to ${url} failed: ${err.message}`);
      // If the error was TLS-related, try next candidate. Continue to try both URLs.
      try {
        // As a second attempt try with stricter TLS (default) in case the previous relaxed option is rejected on server.
        pgClient = new Client({ connectionString: url });
        await pgClient.connect();
        console.log(`Connected to PostgreSQL (strict TLS) via: ${url}`);
        return;
      } catch (err2) {
        console.warn(`Strict TLS attempt also failed for ${url}: ${err2.message}`);
      }
    }
  }

  throw new Error('Unable to connect to PostgreSQL using provided URLs (checked direct and pooler endpoints)');
}

// SQL to create tables (normalized schema)
const SQL_CREATE_TABLES = `
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(255) UNIQUE,
  password TEXT,
  image TEXT DEFAULT '',
  account_type VARCHAR(50) DEFAULT 'User' CHECK (account_type IN ('User', 'Writer', 'Admin')),
  provider VARCHAR(50) DEFAULT 'credentials' CHECK (provider IN ('credentials', 'google')),
  email_verified BOOLEAN DEFAULT FALSE,
  last_login_at TIMESTAMP,
  is_general_admin BOOLEAN DEFAULT FALSE,
  can_post BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  label VARCHAR(255) UNIQUE NOT NULL,
  color VARCHAR(100) DEFAULT 'bg-gray-600',
  icon TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) UNIQUE,
  description TEXT,
  img TEXT,
  cat VARCHAR(255),
    user_id TEXT,
  status BOOLEAN DEFAULT TRUE,
  approved BOOLEAN DEFAULT FALSE,
  approved_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    post_id TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Followers table
CREATE TABLE IF NOT EXISTS followers (
  id TEXT PRIMARY KEY,
    follower_id TEXT NOT NULL,
    writer_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Views table
CREATE TABLE IF NOT EXISTS views (
  id TEXT PRIMARY KEY,
    user_id TEXT,
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Share Logs table
CREATE TABLE IF NOT EXISTS share_logs (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id TEXT,
  platform VARCHAR(100),
  method VARCHAR(100),
  ip VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Banners table
CREATE TABLE IF NOT EXISTS banners (
  id TEXT PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  description TEXT DEFAULT '',
  image TEXT NOT NULL,
  link TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT TRUE,
  "order" INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email Verifications table
CREATE TABLE IF NOT EXISTS email_verifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  otp TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Access Logs table
CREATE TABLE IF NOT EXISTS access_logs (
  id TEXT PRIMARY KEY,
  endpoint VARCHAR(255),
  method VARCHAR(10),
  status_code INT,
  response_time INT,
  ip VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_cat ON posts(cat);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_followers_follower_id ON followers(follower_id);
CREATE INDEX IF NOT EXISTS idx_followers_writer_id ON followers(writer_id);
CREATE INDEX IF NOT EXISTS idx_views_post_id ON views(post_id);
CREATE INDEX IF NOT EXISTS idx_views_user_id ON views(user_id);
CREATE INDEX IF NOT EXISTS idx_share_logs_post_id ON share_logs(post_id);
CREATE INDEX IF NOT EXISTS idx_email_verifications_user_id ON email_verifications(user_id);
`;

async function createTables() {
  try {
    console.log('Creating Postgres tables...');
    await pgClient.query(SQL_CREATE_TABLES);
    // Ensure pgcrypto is available for UUID generation
    try {
      await pgClient.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');
    } catch (ex) {
      console.warn('Warning: could not create pgcrypto extension:', ex.message);
    }

    // Add UUID columns to each table to support native UUID PKs and FKs
    const alterSql = `
      ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS uuid UUID DEFAULT gen_random_uuid();
      console.log('\nMigrating collections...');
      // Create in-memory maps to translate Mongo _id -> Postgres UUID
      const idToUuid = {
        users: new Map(),
        posts: new Map(),
        comments: new Map(),
      };

      for (const col of collections) {
        const name = col.name;
        const docs = await db.collection(name).find({}).toArray();

        if (name === 'users') {
          const query = `
            INSERT INTO users (id, uuid, name, email, username, password, image, account_type, provider, email_verified, last_login_at, is_general_admin, can_post, created_at, updated_at)
            VALUES ($1, gen_random_uuid(), $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            ON CONFLICT(id) DO NOTHING
            RETURNING uuid
          `;
          for (const doc of docs) {
            const res = await pgClient.query(query, [
              doc._id?.toString(),
              doc.name || '',
              doc.email || '',
              doc.username || null,
              doc.password || null,
              doc.image || '',
              doc.accountType || 'User',
              doc.provider || 'credentials',
              doc.emailVerified || false,
              doc.lastLoginAt || null,
              doc.isGeneralAdmin || false,
              doc.canPost !== false,
              doc.createdAt || new Date(),
              doc.updatedAt || new Date(),
            ]);
            let uuidVal = res.rows?.[0]?.uuid || null;
            if (!uuidVal) {
              const r2 = await pgClient.query('SELECT uuid FROM users WHERE id = $1', [doc._id?.toString()]);
              uuidVal = r2.rows?.[0]?.uuid || null;
            }
            if (uuidVal) idToUuid.users.set(doc._id?.toString(), uuidVal);
          }
          console.log(`✓ users: migrated ${idToUuid.users.size} documents (uuid mapping created)`);

        } else if (name === 'posts') {
          const query = `
            INSERT INTO posts (id, uuid, title, slug, description, img, cat, user_id, user_uuid, status, approved, approved_by, approved_at, created_at, updated_at)
            VALUES ($1, gen_random_uuid(), $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            ON CONFLICT(id) DO NOTHING
            RETURNING uuid
          `;
          for (const doc of docs) {
            const userOld = doc.user?.toString?.();
            const userUuid = userOld ? idToUuid.users.get(userOld) || null : null;
            const res = await pgClient.query(query, [
              doc._id?.toString(),
              doc.title || '',
              doc.slug || null,
              doc.desc ?? doc.description ?? null,
              doc.img || null,
              doc.cat || null,
              doc.user?.toString?.() || null,
              userUuid,
              doc.status !== false,
              doc.approved || false,
              doc.approvedBy?.toString?.() || null,
              doc.approvedAt || null,
              doc.createdAt || new Date(),
              doc.updatedAt || new Date(),
            ]);
            let uuidVal = res.rows?.[0]?.uuid || null;
            if (!uuidVal) {
              const r2 = await pgClient.query('SELECT uuid FROM posts WHERE id = $1', [doc._id?.toString()]);
              uuidVal = r2.rows?.[0]?.uuid || null;
            }
            if (uuidVal) idToUuid.posts.set(doc._id?.toString(), uuidVal);
          }
          console.log(`✓ posts: migrated ${idToUuid.posts.size} documents (uuid mapping created)`);

        } else if (name === 'comments') {
          const query = `
            INSERT INTO comments (id, uuid, user_id, user_uuid, post_id, post_uuid, description, created_at, updated_at)
            VALUES ($1, gen_random_uuid(), $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT(id) DO NOTHING
            RETURNING uuid
          `;
          for (const doc of docs) {
            const userOld = doc.user?.toString?.();
            const postOld = doc.post?.toString?.();
            const userUuid = userOld ? idToUuid.users.get(userOld) || null : null;
            const postUuid = postOld ? idToUuid.posts.get(postOld) || null : null;
            const res = await pgClient.query(query, [
              doc._id?.toString(),
              doc.user?.toString?.() || null,
              userUuid,
              doc.post?.toString?.() || null,
              postUuid,
              doc.desc ?? doc.description ?? null,
              doc.createdAt || new Date(),
              doc.updatedAt || new Date(),
            ]);
            let uuidVal = res.rows?.[0]?.uuid || null;
            if (!uuidVal) {
              const r2 = await pgClient.query('SELECT uuid FROM comments WHERE id = $1', [doc._id?.toString()]);
              uuidVal = r2.rows?.[0]?.uuid || null;
            }
            if (uuidVal) idToUuid.comments.set(doc._id?.toString(), uuidVal);
          }
          console.log(`✓ comments: migrated ${idToUuid.comments.size} documents (uuid mapping created)`);

        } else if (name === 'followers') {
          const query = `
            INSERT INTO followers (id, uuid, follower_id, follower_uuid, writer_id, writer_uuid, created_at, updated_at)
            VALUES ($1, gen_random_uuid(), $2, $3, $4, $5, $6, $7)
            ON CONFLICT(id) DO NOTHING
          `;
          for (const doc of docs) {
            const followerOld = doc.followerId?.toString?.();
            const writerOld = doc.writerId?.toString?.();
            const followerUuid = followerOld ? idToUuid.users.get(followerOld) || null : null;
            const writerUuid = writerOld ? idToUuid.users.get(writerOld) || null : null;
            await pgClient.query(query, [
              doc._id?.toString(),
              doc.followerId?.toString?.() || null,
              followerUuid,
              doc.writerId?.toString?.() || null,
              writerUuid,
              doc.createdAt || new Date(),
              doc.updatedAt || new Date(),
            ]);
          }
          console.log(`✓ followers: migrated ${docs.length} documents`);

        } else if (name === 'views') {
          const query = `
            INSERT INTO views (id, uuid, user_id, user_uuid, post_id, post_uuid, created_at)
            VALUES ($1, gen_random_uuid(), $2, $3, $4, $5, $6)
            ON CONFLICT(id) DO NOTHING
          `;
          for (const doc of docs) {
            const userOld = doc.user?.toString?.();
            const postOld = doc.post?.toString?.();
            const userUuid = userOld ? idToUuid.users.get(userOld) || null : null;
            const postUuid = postOld ? idToUuid.posts.get(postOld) || null : null;
            await pgClient.query(query, [
              doc._id?.toString(),
              doc.user?.toString?.() || null,
              userUuid,
              doc.post?.toString?.() || null,
              postUuid,
              doc.createdAt || new Date(),
            ]);
          }
          console.log(`✓ views: migrated ${docs.length} documents`);

        } else if (name === 'sharelogs') {
          const query = `
            INSERT INTO share_logs (id, uuid, post_id, post_uuid, user_id, user_uuid, platform, method, ip, user_agent, created_at, updated_at)
            VALUES ($1, gen_random_uuid(), $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            ON CONFLICT(id) DO NOTHING
          `;
          for (const doc of docs) {
            const postOld = doc.post?.toString?.();
            const userOld = doc.user?.toString?.();
            const postUuid = postOld ? idToUuid.posts.get(postOld) || null : null;
            const userUuid = userOld ? idToUuid.users.get(userOld) || null : null;
            await pgClient.query(query, [
              doc._id?.toString(),
              doc.post?.toString?.() || null,
              postUuid,
              doc.user?.toString?.() || null,
              userUuid,
              doc.platform || null,
              doc.method || null,
              doc.ip || null,
              doc.userAgent || null,
              doc.createdAt || new Date(),
              doc.updatedAt || new Date(),
            ]);
          }
          console.log(`✓ share_logs: migrated ${docs.length} documents`);

        } else if (name === 'banners') {
          const query = `
            INSERT INTO banners (id, uuid, title, description, image, link, is_active, "order", created_at, updated_at)
            VALUES ($1, gen_random_uuid(), $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT(id) DO NOTHING
          `;
          for (const doc of docs) {
            await pgClient.query(query, [
              doc._id?.toString(),
              doc.title || '',
              doc.description || '',
              doc.image || '',
              doc.link || '',
              doc.isActive !== false,
              doc.order || 0,
              doc.createdAt || new Date(),
              doc.updatedAt || new Date(),
            ]);
          }
          console.log(`✓ banners: migrated ${docs.length} documents`);

        } else if (name === 'emailverifications') {
          const query = `
            INSERT INTO email_verifications (id, uuid, user_id, user_uuid, otp, expires_at, verified, created_at, updated_at)
            VALUES ($1, gen_random_uuid(), $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT(id) DO NOTHING
          `;
          for (const doc of docs) {
            const userOld = doc.userId?.toString?.();
            const userUuid = userOld ? idToUuid.users.get(userOld) || null : null;
            await pgClient.query(query, [
              doc._id?.toString(),
              doc.userId?.toString?.() || null,
              userUuid,
              doc.otp || '',
              doc.expiresAt || new Date(),
              doc.verified || false,
              doc.createdAt || new Date(),
              doc.updatedAt || new Date(),
            ]);
          }
          console.log(`✓ email_verifications: migrated ${docs.length} documents`);

        } else if (name === 'accesslogs') {
          const query = `
            INSERT INTO access_logs (id, uuid, endpoint, method, status_code, response_time, ip, user_agent, created_at)
            VALUES ($1, gen_random_uuid(), $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT(id) DO NOTHING
          `;
          for (const doc of docs) {
            await pgClient.query(query, [
              doc._id?.toString(),
              doc.endpoint || null,
              doc.method || null,
              doc.statusCode || null,
              doc.responseTime || null,
              doc.ip || null,
              doc.userAgent || null,
              doc.createdAt || new Date(),
            ]);
          }
          console.log(`✓ access_logs: migrated ${docs.length} documents`);

        } else {
          console.log(`⊘ ${name}: no handler (skipped)`);
        }
      }
          const userUuid = userOld ? idToUuid.users.get(userOld) || null : null;
            doc._id?.toString(),
            doc.followerId?.toString?.() || null,
            doc.writerId?.toString?.() || null,
            doc.createdAt || new Date(),
            doc.updatedAt || new Date(),
          ]);
        }
        console.log(`✓ followers: migrated ${docs.length} documents`);
      } else if (name === 'views') {
        const query = `
          INSERT INTO views (id, user_id, post_id, created_at)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT(id) DO NOTHING
        for (const doc of docs) {
        for (const doc of docs) {
          await pgClient.query(query, [
            doc._id?.toString(),
            doc.user?.toString?.() || null,
            doc.post?.toString?.() || null,
            doc.createdAt || new Date(),
          ]);
        }
        console.log(`✓ views: migrated ${docs.length} documents`);
      } else if (name === 'sharelogs') {
        const query = `
          INSERT INTO share_logs (id, post_id, user_id, platform, method, ip, user_agent, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT(id) DO NOTHING
        `;
        for (const doc of docs) {
          await pgClient.query(query, [
            doc._id?.toString(),
            doc.post?.toString?.() || null,
            doc.user?.toString?.() || null,
            doc.platform || null,
            doc.method || null,
            doc.ip || null,
            doc.userAgent || null,
            doc.createdAt || new Date(),
            doc.updatedAt || new Date(),
          ]);
        }
        console.log(`✓ share_logs: migrated ${docs.length} documents`);
      } else if (name === 'banners') {
        const query = `
          INSERT INTO banners (id, title, description, image, link, is_active, "order", created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT(id) DO NOTHING
        `;
        for (const doc of docs) {
          await pgClient.query(query, [
            doc._id?.toString(),
            doc.title || '',
            doc.description || '',
            doc.image || '',
            doc.link || '',
            doc.isActive !== false,
            doc.order || 0,
            doc.createdAt || new Date(),
            doc.updatedAt || new Date(),
          ]);
        }
        console.log(`✓ banners: migrated ${docs.length} documents`);
      } else if (name === 'emailverifications') {
        const query = `
          INSERT INTO email_verifications (id, user_id, otp, expires_at, verified, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT(id) DO NOTHING
        `;
        for (const doc of docs) {
          await pgClient.query(query, [
            doc._id?.toString(),
            doc.userId?.toString?.() || null,
            doc.otp || '',
            doc.expiresAt || new Date(),
            doc.verified || false,
            doc.createdAt || new Date(),
            doc.updatedAt || new Date(),
          ]);
        }
        console.log(`✓ email_verifications: migrated ${docs.length} documents`);
      } else if (name === 'accesslogs') {
        const query = `
          INSERT INTO access_logs (id, endpoint, method, status_code, response_time, ip, user_agent, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT(id) DO NOTHING
        `;
        for (const doc of docs) {
          await pgClient.query(query, [
            doc._id?.toString(),
            doc.endpoint || null,
            doc.method || null,
            doc.statusCode || null,
            doc.responseTime || null,
            doc.ip || null,
            doc.userAgent || null,
            doc.createdAt || new Date(),
          ]);
        }
        console.log(`✓ access_logs: migrated ${docs.length} documents`);
      } else {
        console.log(`⊘ ${name}: no handler (skipped)`);
      }
    }

    console.log('\n✓ Migration completed successfully!');
    console.log('All MongoDB collections have been migrated to PostgreSQL.');

  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await mongoose.disconnect();
    await pgClient.end();
  }
}

main();
