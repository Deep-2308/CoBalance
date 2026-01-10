import express from 'express';
import { getDashboardSummary } from '../controllers/dashboard.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/summary', getDashboardSummary);

export default router;
