import express from 'express';
import { generateReminder } from '../controllers/reminders.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/generate', generateReminder);

export default router;
