import express from 'express';
import { getEpisode } from '../controllers/episodeController.js';
import { getEpisodeComments, postEpisodeComment } from '../controllers/episodeCommentController.js';
import userAuth from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/episodes/:id - episode detail
router.get('/:id', getEpisode);

// GET /api/episodes/:id/comments - list comments
router.get('/:id/comments', getEpisodeComments);

// POST /api/episodes/:id/comments - add comment (authenticated)
router.post('/:id/comments', userAuth, postEpisodeComment);

export default router;
