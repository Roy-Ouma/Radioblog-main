import ShareLog from '../models/ShareLog.js';
import Posts from '../models/Posts.js';
import ShareShortLink from '../models/ShareShortLink.js';
import crypto from 'crypto';

function generateToken(len = 7) {
  const alphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const bytes = crypto.randomBytes(len);
  let token = '';
  for (let i = 0; i < bytes.length; i++) token += alphabet[bytes[i] % alphabet.length];
  return token;
}

export const logShare = async (req, res, next) => {
  try {
    const { id: postId } = req.params;
    const { platform, method } = req.body || {};
    const userId = req.user?.userId || req.body.userId || undefined;

    // ensure post exists (no need to block sharing if missing, but validate)
    const post = await Posts.findById(postId).select('_id');
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const log = await ShareLog.create({
      post: postId,
      user: userId,
      platform: platform || 'unknown',
      method: method || 'button',
      ip: req.ip,
      userAgent: req.get('User-Agent') || '',
    });

    return res.status(201).json({ success: true, message: 'Share logged', data: { id: log._id } });
  } catch (err) {
    console.error('Error logging share', err);
    return res.status(500).json({ success: false, message: 'Unable to log share' });
  }
};

export const fetchShareLogs = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(200, parseInt(req.query.limit, 10) || 50);
    const skip = (page - 1) * limit;

    const { platform, post, startDate, endDate } = req.query;
    const filter = {};
    if (platform) filter.platform = platform;
    if (post) filter.post = post;

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        const sd = new Date(startDate);
        if (!Number.isNaN(sd.getTime())) filter.createdAt.$gte = sd;
      }
      if (endDate) {
        const ed = new Date(endDate);
        if (!Number.isNaN(ed.getTime())) {
          // Include the whole end date day if time is not provided
          filter.createdAt.$lte = ed;
        }
      }
      // if createdAt ended up empty, remove it
      if (Object.keys(filter.createdAt).length === 0) delete filter.createdAt;
    }

    const total = await ShareLog.countDocuments(filter);

    const logs = await ShareLog.find(filter)
      .populate({ path: 'post', select: 'title slug' })
      .populate({ path: 'user', select: 'name email' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return res.json({ success: true, data: logs, meta: { total, page, limit, filters: { platform, post, startDate, endDate } } });
  } catch (err) {
    console.error('Error fetching share logs', err);
    return res.status(500).json({ success: false, message: 'Unable to fetch share logs' });
  }
};

// Redirect endpoint: logs a share then 302-redirects to the frontend post URL
export const redirectShare = async (req, res, next) => {
  try {
    const idOrToken = req.params.id;
    const platform = req.query.platform || 'redirect';
    const method = req.query.method || 'redirect';

    // First, check if this is a token
    let short = await ShareShortLink.findOne({ token: idOrToken }).exec();
    let postId = null;
    if (short) {
      postId = short.post;
      // increment clicks (non-blocking)
      ShareShortLink.updateOne({ _id: short._id }, { $inc: { clicks: 1 } }).catch(() => {});
    } else {
      postId = idOrToken; // treat as post id
    }

    const post = await Posts.findById(postId).select('title slug img');
    if (!post) return res.status(404).send('Post not found');

    // create share log (do not await blocking the redirect too long)
    try {
      ShareLog.create({
        post: post._id,
        user: req.user?.userId || undefined,
        platform,
        method,
        ip: req.ip,
        userAgent: req.get('User-Agent') || '',
      }).catch((e) => console.warn('ShareLog create failed:', e && e.message));
    } catch (e) {
      console.warn('Unable to write share log:', e && e.message);
    }

    // Build frontend URL
    const FRONTEND_URL = process.env.FRONTEND_URL || (process.env.CORS_ALLOWED_ORIGINS || '').split(',')[0] || 'http://localhost:3000';
    const base = String(FRONTEND_URL).replace(/\/$/, '');
    const slugPart = post.slug ? encodeURIComponent(String(post.slug).replace(/\s+/g, '-')) : 'post';
    const webUrl = `${base}/${slugPart}/${post._id}`;

    return res.redirect(302, webUrl);
  } catch (err) {
    console.error('redirectShare error', err);
    return res.status(500).send('Unable to redirect');
  }
};

// Create a short token for a post
export const createShortLink = async (req, res, next) => {
  try {
    const { id: postId } = req.params;
    const { expiresInDays } = req.body || {};

    const post = await Posts.findById(postId).select('_id');
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    // optional: if a short link already exists for this post and is not expired, return it
    const now = new Date();
    const existing = await ShareShortLink.findOne({ post: postId, $or: [ { expiresAt: { $exists: false } }, { expiresAt: { $gt: now } } ] }).exec();
    if (existing) {
      return res.json({ success: true, data: { token: existing.token, url: `${getBackendBase(req)}/r/${existing.token}` } });
    }

    // generate unique token (retry on collision)
    let token;
    for (let i = 0; i < 5; i++) {
      token = generateToken(7);
      // try to insert; if exists, retry
      const exists = await ShareShortLink.findOne({ token }).lean().exec();
      if (!exists) break;
      token = null;
    }
    if (!token) return res.status(500).json({ success: false, message: 'Unable to generate unique token' });

    const doc = new ShareShortLink({
      token,
      post: post._id,
      user: req.user?.userId || undefined,
    });
    if (expiresInDays && Number(expiresInDays) > 0) {
      doc.expiresAt = new Date(Date.now() + Number(expiresInDays) * 24 * 60 * 60 * 1000);
    }
    await doc.save();

    return res.status(201).json({ success: true, data: { token, url: `${getBackendBase(req)}/r/${token}` } });
  } catch (err) {
    console.error('createShortLink error', err);
    return res.status(500).json({ success: false, message: 'Unable to create short link' });
  }
};

function getBackendBase(req) {
  // derive backend base URL from request if possible
  const protocol = req.protocol || 'http';
  const host = req.get('host') || `localhost:${process.env.PORT || 8800}`;
  return `${protocol}://${host}`;
}
