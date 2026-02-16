import express from 'express';
import { 
    signupWithPassword,
    loginWithPassword,
    forgotPassword,
    resetPassword,
    setPassword,
    updateProfile, 
    getCurrentUser 
} from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { loginLimiter, passwordResetLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// ============================================
// EMAIL/PASSWORD AUTH (Public)
// ============================================
router.post('/signup-password', signupWithPassword);
router.post('/login-password', loginLimiter, loginWithPassword);

// ============================================
// PASSWORD RECOVERY (Public, rate-limited)
// ============================================
router.post('/forgot-password', passwordResetLimiter, forgotPassword);
router.post('/reset-password', resetPassword);

// ============================================
// LEGACY ACCOUNT MIGRATION (Public, rate-limited)
// ============================================
router.post('/set-password', passwordResetLimiter, setPassword);

// ============================================
// PROTECTED ROUTES
// ============================================
router.post('/update-profile', authenticateToken, updateProfile);
router.get('/me', authenticateToken, getCurrentUser);

export default router;
