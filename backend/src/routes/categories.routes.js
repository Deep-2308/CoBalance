import { Router } from 'express';
import { getCategorySummary, getCategories } from '../controllers/categories.controller.js';

const router = Router();

// Get list of available categories
router.get('/', getCategories);

// Get category-wise summary for current month
router.get('/summary', getCategorySummary);

export default router;
