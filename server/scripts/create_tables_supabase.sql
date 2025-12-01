-- Supabase / Postgres schema generated to mirror MongoDB collections
-- Run this file with psql, the Supabase SQL editor, or the included Node runner.

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

-- Posts table
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

-- Indexes
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

-- Optional: add UUID columns if you later want native UUID PKs
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS uuid UUID DEFAULT gen_random_uuid();
-- ALTER TABLE posts ADD COLUMN IF NOT EXISTS uuid UUID DEFAULT gen_random_uuid();
-- ALTER TABLE comments ADD COLUMN IF NOT EXISTS uuid UUID DEFAULT gen_random_uuid();
