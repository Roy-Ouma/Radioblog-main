import express from 'express';
import { userAuth } from '../middleware/authMiddleware.js';
import {
  createPost,
  getFollowers,
  getPostContent,
  stats,
  commentPost,
  updatePost,
  getPosts,
  getPopularContents,
  getPost,
  getComments,
  deletePost,
  deleteComment,
  likePost,
  unlikePost,
} from '../controllers/postController.js';
import { createShortLink } from '../controllers/shareController.js';
import { getShareLink } from '../controllers/postController.js';
import { logShare } from '../controllers/shareController.js';
import { getActiveBanners } from '../controllers/bannerController.js';
import { commentLimiter, createPostLimiter, likeLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();// Controller functions (to be implemented)
//ADMIN ROUTES

router.post("/admin-analytics", userAuth, stats);
router.post("/admin-followers", userAuth, getFollowers);
router.post("/admin-content", userAuth, getPostContent);
router.post("/create-post", userAuth, createPostLimiter, createPost);

//LIKE & COMMENT ON POST
router.post("/comment/:id", userAuth, commentLimiter, commentPost);
router.post("/like/:id", userAuth, likeLimiter, likePost);
router.post("/unlike/:id", userAuth, likeLimiter, unlikePost);


//UPDATE POST
router.patch("/update/:id", userAuth, updatePost);

//GET A POST
router.get("/", getPosts);
router.get("/popular", getPopularContents);
router.get("/banners", getActiveBanners);
router.get('/share-link/:id', getShareLink);
router.post('/short-link/:id', createShortLink);
router.get("/:id", getPost);
router.get("/comments/:postId", getComments);

// Share analytics logging
router.post('/share/:id', logShare);


//DELETE POST
router.delete("/:id", userAuth, deletePost);
router.delete("/comment/:id/:postId", userAuth, deleteComment);

export default router;