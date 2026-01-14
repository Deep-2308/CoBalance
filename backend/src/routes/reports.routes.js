import { Router } from 'express';
import { getMonthlyReport } from '../controllers/reports.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

// GET /api/reports/monthly?month=<1-12>&year=<YYYY>
router.get('/monthly', authenticateToken, getMonthlyReport);

export default router;
