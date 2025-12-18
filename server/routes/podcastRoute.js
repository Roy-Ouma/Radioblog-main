import express from 'express';
import { getPodcasts, getPodcast } from '../controllers/podcastController.js';

const router = express.Router();

// GET /api/podcasts - list
router.get('/', getPodcasts);

// GET /api/podcasts/:id - detail
router.get('/:id', getPodcast);

export default router;
