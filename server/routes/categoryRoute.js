import express from 'express';
import { getCategories } from '../controllers/categoryController.js';

const router = express.Router();

// Public GET /api/categories
router.get('/', getCategories);

export default router;
