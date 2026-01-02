import express from 'express';
import {
	getShows,
	getShow,
	getTrendingShows,
} from '../controllers/showController.js';
import { getEpisode, listEpisodesByShow } from '../controllers/episodeController.js';

const router = express.Router();

// GET /api/podcasts - list shows
router.get('/', getShows);

// GET /api/podcasts/trending - trending shows
router.get('/trending', getTrendingShows);

// GET /api/podcasts/:id - show detail (with episodes)
router.get('/:id', getShow);

// GET /api/podcasts/:showId/episodes - list episodes for a show
router.get('/:showId/episodes', listEpisodesByShow);

// GET /api/episodes/:id - episode detail
router.get('/episodes/:id', getEpisode);

export default router;
