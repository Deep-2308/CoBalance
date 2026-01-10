import express from 'express';
import { sendOTP, verifyOTP, updateProfile, getCurrentUser } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);

// Protected routes
router.post('/update-profile', authenticateToken, updateProfile);
router.get('/me', authenticateToken, getCurrentUser);

export default router;
