import express from 'express';
import { getProfile, updateProfile } from '../controllers/profile.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// All profile routes require authentication
router.use(authenticateToken);

// Get user profile
router.get('/', getProfile);

// Update user profile
router.put('/', updateProfile);

export default router;
