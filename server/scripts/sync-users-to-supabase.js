import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Client } from 'pg';
import Users from '../models/UserModel.js';
import { supabase } from '../utils/supabaseClient.js';

dotenv.config();

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { dry: false, limit: null, auth: false, sendReset: false };
  for (const a of args) {
    if (a === '--dry') opts.dry = true;
    else if (a.startsWith('--limit=')) opts.limit = parseInt(a.split('=')[1], 10) || null;
    else if (a === '--auth') opts.auth = true;
    else if (a === '--send-reset') opts.sendReset = true;
  }
  return opts;
}

async function connectPostgres() {
  const url = process.env.DATABASE_URL || process.env.DIRECT_URL;
  if (!url) throw new Error('DATABASE_URL (or DIRECT_URL) is required in environment');
  let client;
  try {
    client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
    await client.connect();
    return client;
  } catch (err) {
    if (client) try { await client.end(); } catch {};
    client = new Client({ connectionString: url });
    await client.connect();
    return client;
  }
}

async function main() {
  const opts = parseArgs();
  console.log('Sync users to Supabase Postgres — options', opts);

  const MONGODB_URL = process.env.MONGODB_URL;
  if (!MONGODB_URL) {
    console.error('MONGODB_URL is required in .env');
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');

  const client = await connectPostgres();
  console.log('Connected to Postgres');

  try {
    const query = Users.find({}).sort({ _id: 1 });
    if (opts.limit) query.limit(opts.limit);
    const docs = await query.lean().exec();

    console.log(`Found ${docs.length} users in MongoDB`);

    const upsertSql = `INSERT INTO users (id, name, email, username, image, account_type, provider, email_verified, last_login_at, is_general_admin, can_post, created_at, updated_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        username = EXCLUDED.username,
        image = EXCLUDED.image,
        account_type = EXCLUDED.account_type,
        provider = EXCLUDED.provider,
        email_verified = EXCLUDED.email_verified,
        last_login_at = EXCLUDED.last_login_at,
        is_general_admin = EXCLUDED.is_general_admin,
        can_post = EXCLUDED.can_post,
        updated_at = EXCLUDED.updated_at;`;

    // helper to make a temporary password for new supabase users
    const makeTempPassword = (len = 12) => {
      const alpha = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
      let s = '';
      for (let i = 0; i < len; i++) s += alpha[Math.floor(Math.random() * alpha.length)];
      return s;
    };

    let applied = 0;
    for (const u of docs) {
      const id = u._id?.toString?.() || String(u._id);
      // Normalize emailVerified: only treat verified when provider is Google or Supabase
      const provider = (u.provider || '').toLowerCase();
      let emailVerifiedFlag = !!u.emailVerified;
      if (emailVerifiedFlag && provider !== 'google' && provider !== 'supabase') {
        console.warn(`User ${id} has emailVerified=true but provider='${provider}' — forcing false during sync.`);
        emailVerifiedFlag = false;
      }

      const vals = [
        id,
        u.name || '',
        (u.email || '').toLowerCase(),
        u.username || null,
        u.image || '',
        u.accountType || u.account_type || 'User',
        u.provider || 'credentials',
        emailVerifiedFlag,
        u.lastLoginAt || u.last_login_at || null,
        !!u.isGeneralAdmin,
        typeof u.canPost === 'undefined' ? true : !!u.canPost,
        u.createdAt || u.created_at || new Date(),
        u.updatedAt || u.updated_at || new Date(),
      ];

      if (opts.dry) {
        console.log('[dry] upsert user:', vals[0], vals[1], vals[2]);
      } else {
        try {
          await client.query(upsertSql, vals);
          applied++;
        } catch (err) {
          console.warn('Failed to upsert user', id, err.message || err);
        }
      }

      // Optionally create Supabase Auth user for this account
      if (opts.auth) {
        if (!supabase || !supabase.auth) {
          console.warn('Supabase client is not configured; skipping auth creation. Set SUPABASE_URL and SUPABASE_SERVICE_KEY in server/.env');
        } else {
        const email = (u.email || '').toLowerCase();
        if (!email) {
          console.warn('Skipping Supabase auth create: no email for user', id);
          continue;
        }

        try {
          // Try to create a user via Supabase Admin API
          const tempPassword = makeTempPassword();
          const createPayload = { email, password: tempPassword };
          console.log(`Creating Supabase auth user for ${email}...`);
          const { data: createData, error: createError } = await supabase.auth.admin.createUser?.(createPayload) || await supabase.auth.admin.createUser(createPayload).catch(e=>({ error: e }));

          if (createError) {
            const msg = createError?.message || String(createError);
            // If user already exists, optionally send reset
            console.warn('Supabase createUser error for', email, msg);
            if (opts.sendReset) {
              console.log('Attempting to send password reset for existing user', email);
              try {
                const { data: resetData, error: resetErr } = await supabase.auth.resetPasswordForEmail?.(email, { redirectTo: process.env.FRONTEND_URL }) || await supabase.auth.resetPasswordForEmail(email).catch(e=>({ error: e }));
                if (resetErr) console.warn('Password reset failed:', resetErr.message || resetErr);
                else console.log('Password reset initiated for', email);
              } catch (e) {
                console.warn('Password reset exception:', e && e.message);
              }
            }
          } else {
            console.log('Supabase user created:', email);
            if (opts.sendReset) {
              try {
                const { data: resetData, error: resetErr } = await supabase.auth.resetPasswordForEmail?.(email, { redirectTo: process.env.FRONTEND_URL }) || await supabase.auth.resetPasswordForEmail(email).catch(e=>({ error: e }));
                if (resetErr) console.warn('Password reset failed:', resetErr.message || resetErr);
                else console.log('Password reset initiated for', email);
              } catch (e) {
                console.warn('Password reset exception:', e && e.message);
              }
            }
          }
        } catch (err) {
          console.warn('Supabase auth operation failed for', u.email, err && err.message);
        }
      }
      }
    }

    console.log(`Completed. Applied: ${applied} / ${docs.length}`);
  } finally {
    try { await mongoose.disconnect(); } catch {}
    try { await client.end(); } catch {}
  }
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('sync-users-to-supabase.js')) {
  main().catch(err => { console.error(err); process.exit(1); });
}
