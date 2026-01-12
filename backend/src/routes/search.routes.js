import express from 'express';
import { search } from '../controllers/search.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// GET /api/search?q=<term>
router.get('/', authenticateToken, search);

export default router;
