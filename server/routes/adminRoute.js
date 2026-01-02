import express from 'express';
import { adminAuth, generalAdminAuth } from '../middleware/adminAuth.js';
import { accessLog } from '../middleware/accessLogMiddleware.js';
import AccessLog from '../models/AccessLog.js';
import User from '../models/UserModel.js';
import Followers from '../models/Followers.js';
import { fetchShareLogs } from '../controllers/shareController.js';
import { getAllBanners, createBanner, updateBanner, deleteBanner } from '../controllers/bannerController.js';
import { createCategory, updateCategory, deleteCategory } from '../controllers/categoryController.js';
import { createPodcast as adminCreatePodcast, adminGetPodcasts, updatePodcast, deletePodcast } from '../controllers/podcastController.js';
import { createShow, getShows as adminGetShows, updateShow, deleteShow } from '../controllers/showController.js';
import { createEpisode, updateEpisode, deleteEpisode } from '../controllers/episodeController.js';

const router = express.Router();

// GET /api/admin/logs - general admin only
router.get('/logs', generalAdminAuth, accessLog(), async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const p = Math.max(1, parseInt(page, 10) || 1);
    const l = Math.min(200, parseInt(limit, 10) || 50);
    const skip = (p - 1) * l;
    const logs = await AccessLog.find().sort({ createdAt: -1 }).skip(skip).limit(l).lean();
    const total = await AccessLog.countDocuments();
    return res.json({ success: true, data: logs, meta: { total, page: p, limit: l } });
  } catch (err) {
    console.error('GET /admin/logs error', err);
    return res.status(500).json({ success: false, message: 'Unable to fetch logs' });
  }
});

// GET /api/admin/users - admin access (list users) - optional query filter
router.get('/users', adminAuth, accessLog(), async (req, res) => {
  try {
    const users = await User.find().select('-password').limit(200).lean();
    return res.json({ success: true, data: users });
  } catch (err) {
    console.error('GET /admin/users error', err);
    return res.status(500).json({ success: false, message: 'Unable to fetch users' });
  }
});

// POST /api/admin/users/:id/role - change accountType / general admin flag (general admin only)
router.post('/users/:id/role', generalAdminAuth, accessLog(), async (req, res) => {
  try {
    const { id } = req.params;
    const { accountType, isGeneralAdmin } = req.body;

    if (!id) return res.status(400).json({ success: false, message: 'Missing user id' });
    if (!accountType || !['User', 'Writer', 'Admin'].includes(accountType)) {
      return res.status(400).json({ success: false, message: 'Invalid accountType provided' });
    }

    const update = { accountType };
    if (typeof isGeneralAdmin === 'boolean') update.isGeneralAdmin = isGeneralAdmin;

    const updated = await User.findByIdAndUpdate(id, update, { new: true }).select('-password');
    if (!updated) return res.status(404).json({ success: false, message: 'User not found' });

    return res.json({ success: true, message: 'User role updated', user: updated });
  } catch (err) {
    console.error('POST /admin/users/:id/role error', err);
    return res.status(500).json({ success: false, message: 'Unable to update user role' });
  }
});

// POST /api/admin/users/:id/toggle-posting - enable/disable posting for a user (admin only)
router.post('/users/:id/toggle-posting', adminAuth, accessLog(), async (req, res) => {
  try {
    const { id } = req.params;
    const { enable } = req.body;

    if (typeof enable !== 'boolean') return res.status(400).json({ success: false, message: 'Missing enable boolean in body' });

    const user = await User.findByIdAndUpdate(id, { canPost: enable }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    return res.json({ success: true, message: `User posting ${enable ? 'enabled' : 'disabled'}`, user });
  } catch (err) {
    console.error('POST /admin/users/:id/toggle-posting error', err);
    return res.status(500).json({ success: false, message: 'Unable to toggle posting' });
  }
});

// POST /api/admin/users/:id/reset-password - trigger password reset for a user (admin)
router.post('/users/:id/reset-password', adminAuth, accessLog(), async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: 'Missing user id' });

    // delegate to controller logic
    const { adminResetPassword } = await import('../controllers/userController.js');
    return adminResetPassword(req, res);
  } catch (err) {
    console.error('POST /admin/users/:id/reset-password error', err);
    return res.status(500).json({ success: false, message: 'Unable to initiate password reset' });
  }
});

// POST /api/admin/posts/:id/approve - approve a post (general admin only)
router.post('/posts/:id/approve', generalAdminAuth, accessLog(), async (req, res) => {
  try {
    const { id } = req.params;
    const post = await (await import('../models/Posts.js')).default.findById(id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    post.approved = true;
    // Mark as published when a General Admin approves the post so it shows on public pages
    post.status = true;
    try {
      // record who approved and when if available
      if (req.currentUser?._id) {
        post.approvedBy = req.currentUser._id;
        post.approvedAt = new Date();
      }
    } catch (e) {
      // ignore
    }
    await post.save();
    return res.json({ success: true, message: 'Post approved' });
  } catch (err) {
    console.error('approve post error', err);
    return res.status(500).json({ success: false, message: 'Unable to approve post' });
  }
});

// POST /api/admin/posts/:id/unapprove - revoke approval
router.post('/posts/:id/unapprove', generalAdminAuth, accessLog(), async (req, res) => {
  try {
    const { id } = req.params;
    const post = await (await import('../models/Posts.js')).default.findById(id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    post.approved = false;
    // When unapproving, also ensure the post is not published publicly
    post.status = false;
    // clear approval audit fields
    post.approvedBy = undefined;
    post.approvedAt = undefined;
    await post.save();
    return res.json({ success: true, message: 'Post unapproved' });
  } catch (err) {
    console.error('unapprove post error', err);
    return res.status(500).json({ success: false, message: 'Unable to unapprove post' });
  }
});

// PATCH /api/admin/posts/:id - edit a post (admin or original author can edit before approval, admins can always edit)
router.patch('/posts/:id', adminAuth, accessLog(), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, desc, description, img, cat } = req.body;
    const Posts = (await import('../models/Posts.js')).default;
    
    const post = await Posts.findById(id).populate({ path: 'user', select: 'name email' });
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    // Allow edit if: user is admin OR user is the original author
    const isAuthor = req.user?.userId?.toString() === post.user?._id?.toString();
    const canEdit = req.currentUser?.isGeneralAdmin || isAuthor;
    
    if (!canEdit) {
      return res.status(403).json({ success: false, message: 'You do not have permission to edit this post' });
    }

    // Update allowed fields (handle both desc and description for backwards compatibility)
    if (title !== undefined && title.trim()) post.title = title;
    const descValue = desc || description;
    if (descValue !== undefined && descValue.trim()) post.desc = descValue;
    if (img !== undefined) post.img = img;
    if (cat !== undefined) post.cat = cat;

    const updated = await post.save();
    return res.json({ 
      success: true, 
      message: 'Post updated successfully',
      data: await updated.populate([
        { path: 'user', select: 'name email image' },
        { path: 'approvedBy', select: 'name email' }
      ])
    });
  } catch (err) {
    console.error('PATCH /admin/posts/:id error', err);
    return res.status(500).json({ success: false, message: 'Unable to update post' });
  }
});

// GET /api/admin/posts/pending - list unapproved posts (admins)
router.get('/posts/pending', adminAuth, accessLog(), async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, parseInt(req.query.limit, 10) || 20);
    const skip = (page - 1) * limit;

    const Posts = (await import('../models/Posts.js')).default;

    // Match posts where approved is false OR the field is missing (legacy docs created before schema update)
    const filter = { $or: [{ approved: false }, { approved: { $exists: false } }] };
    const total = await Posts.countDocuments(filter);
    const posts = await Posts.find(filter)
      .select('title slug desc img cat views comments status approved approvedBy approvedAt createdAt updatedAt user')
      .populate({ path: 'user', select: 'name email image' })
      .populate({ path: 'approvedBy', select: 'name email' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return res.json({ success: true, data: posts, meta: { total, page, limit } });
  } catch (err) {
    console.error('GET /admin/posts/pending error', err);
    return res.status(500).json({ success: false, message: 'Unable to fetch pending posts' });
  }
});

// GET /api/admin/share-logs - paginated share analytics
router.get('/share-logs', adminAuth, accessLog(), fetchShareLogs);

// Banners CRUD (admin only)
router.get('/banners', adminAuth, accessLog(), getAllBanners);
router.post('/banners', generalAdminAuth, accessLog(), createBanner);
router.patch('/banners/:id', generalAdminAuth, accessLog(), updateBanner);
router.delete('/banners/:id', generalAdminAuth, accessLog(), deleteBanner);

// Categories CRUD (general admin only)
router.get('/categories', adminAuth, accessLog(), async (req, res) => {
  // list categories for admin panel
  try {
    const cats = await (await import('../models/Category.js')).default.find().sort({ label: 1 }).lean();
    return res.json({ success: true, data: cats });
  } catch (err) {
    console.error('GET /admin/categories error', err);
    return res.status(500).json({ success: false, message: 'Unable to fetch categories' });
  }
});

router.post('/categories', generalAdminAuth, accessLog(), createCategory);
router.patch('/categories/:id', generalAdminAuth, accessLog(), updateCategory);
router.delete('/categories/:id', generalAdminAuth, accessLog(), deleteCategory);

// Admin: create podcast (expects JSON with audioUrl and thumbnail URLs, or admin UI should upload files first to /api/storage/upload)
router.post('/podcasts', generalAdminAuth, accessLog(), async (req, res) => {
  try {
    // delegate to controller
    return adminCreatePodcast(req, res);
  } catch (err) {
    console.error('POST /admin/podcasts error', err);
    return res.status(500).json({ success: false, message: 'Unable to create podcast' });
  }
});

// GET /api/admin/podcasts - list podcasts (admin)
router.get('/podcasts', adminAuth, accessLog(), async (req, res) => {
  try {
    return adminGetPodcasts(req, res);
  } catch (err) {
    console.error('GET /admin/podcasts error', err);
    return res.status(500).json({ success: false, message: 'Unable to fetch podcasts' });
  }
});

// PATCH /api/admin/podcasts/:id - update podcast metadata (general admin)
router.patch('/podcasts/:id', generalAdminAuth, accessLog(), async (req, res) => {
  try {
    return updatePodcast(req, res);
  } catch (err) {
    console.error('PATCH /admin/podcasts/:id error', err);
    return res.status(500).json({ success: false, message: 'Unable to update podcast' });
  }
});

// DELETE /api/admin/podcasts/:id - delete podcast (general admin)
router.delete('/podcasts/:id', generalAdminAuth, accessLog(), async (req, res) => {
  try {
    return deletePodcast(req, res);
  } catch (err) {
    console.error('DELETE /admin/podcasts/:id error', err);
    return res.status(500).json({ success: false, message: 'Unable to delete podcast' });
  }
});

// Shows (podcast series) CRUD
router.post('/shows', generalAdminAuth, accessLog(), async (req, res) => {
  try {
    return createShow(req, res);
  } catch (err) {
    console.error('POST /admin/shows error', err);
    return res.status(500).json({ success: false, message: 'Unable to create show' });
  }
});

router.get('/shows', adminAuth, accessLog(), async (req, res) => {
  try {
    return adminGetShows(req, res);
  } catch (err) {
    console.error('GET /admin/shows error', err);
    return res.status(500).json({ success: false, message: 'Unable to fetch shows' });
  }
});

router.patch('/shows/:id', generalAdminAuth, accessLog(), async (req, res) => {
  try {
    return updateShow(req, res);
  } catch (err) {
    console.error('PATCH /admin/shows/:id error', err);
    return res.status(500).json({ success: false, message: 'Unable to update show' });
  }
});

router.delete('/shows/:id', generalAdminAuth, accessLog(), async (req, res) => {
  try {
    return deleteShow(req, res);
  } catch (err) {
    console.error('DELETE /admin/shows/:id error', err);
    return res.status(500).json({ success: false, message: 'Unable to delete show' });
  }
});

// Episodes CRUD
router.post('/shows/:id/episodes', generalAdminAuth, accessLog(), async (req, res) => {
  try {
    // create episode under show id
    req.params.showId = req.params.id;
    return createEpisode(req, res);
  } catch (err) {
    console.error('POST /admin/shows/:id/episodes error', err);
    return res.status(500).json({ success: false, message: 'Unable to create episode' });
  }
});

router.patch('/episodes/:id', generalAdminAuth, accessLog(), async (req, res) => {
  try {
    return updateEpisode(req, res);
  } catch (err) {
    console.error('PATCH /admin/episodes/:id error', err);
    return res.status(500).json({ success: false, message: 'Unable to update episode' });
  }
});

router.delete('/episodes/:id', generalAdminAuth, accessLog(), async (req, res) => {
  try {
    return deleteEpisode(req, res);
  } catch (err) {
    console.error('DELETE /admin/episodes/:id error', err);
    return res.status(500).json({ success: false, message: 'Unable to delete episode' });
  }
});

// DELETE /api/admin/followers/:id - remove a follower record (admin)
router.delete('/followers/:id', adminAuth, accessLog(), async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: 'Missing follower id' });

    const follower = await Followers.findById(id);
    if (!follower) return res.status(404).json({ success: false, message: 'Follower not found' });

    // delete the follower record
    await Followers.findByIdAndDelete(id);

    // remove reference from the user's followers array if present
    try {
      const user = await User.findById(follower.userId);
      if (user) {
        user.followers = (user.followers || []).filter((f) => String(f) !== String(id));
        await user.save();
      }
    } catch (e) {
      // ignore secondary errors but log
      console.error('Error removing follower reference from user:', e);
    }

    return res.json({ success: true, message: 'Follower removed' });
  } catch (err) {
    console.error('DELETE /admin/followers/:id error', err);
    return res.status(500).json({ success: false, message: 'Unable to remove follower' });
  }
});

router.get('/analytics', adminAuth, accessLog(), async (req, res) => {
  try {
    const Users = (await import('../models/UserModel.js')).default;
    const Posts = (await import('../models/Posts.js')).default;
    const Followers = (await import('../models/Followers.js')).default;
    let Views;
    try { Views = (await import('../models/Views.js')).default; } catch (e) {}

    // 1. Get Totals (Accurate Counts)
    // We filter by { status: true } to count ONLY published posts.
    // If you want to count everything, remove the { status: true } part.
    const totalPosts = await Posts.countDocuments({ status: true }); 
    const totalWriters = await Users.countDocuments({ accountType: "Writer" });
    const followers = await Followers.countDocuments();
    const totalViews = Views ? await Views.countDocuments() : 0;

    // 2. This creates an array of last 28 days with 0 views (or real data if you have it)
    const last28Days = Array.from({ length: 28 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (27 - i));
      return d.toISOString().split('T')[0]; // Format: "YYYY-MM-DD"
    });

    const viewStats = last28Days.map(date => ({
      date: date,
      views: 0 // TODO: Replace this 0 with a real DB query for views per day if available
    }));

    // 3. Send Response
    res.status(200).json({
      totalPosts,
      followers,
      totalViews,
      totalWriters,
      postsDiff: 0,
      followersDiff: 0,
      viewsDiff: 0,
      writersDiff: 0,
      viewStats: viewStats
    });

  } catch (error) {
    console.error("GET /admin/analytics error:", error);
    res.status(500).json({ message: "Error fetching analytics" });
  }
});

export default router;
