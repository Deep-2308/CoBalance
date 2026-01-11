import express from 'express';
import { 
    sendLoginOTP, 
    verifyLoginOTP, 
    sendRegisterOTP, 
    verifyRegisterOTP, 
    completeRegistration,
    updateProfile, 
    getCurrentUser 
} from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// ============================================
// LOGIN FLOW (user must exist)
// ============================================
router.post('/login/send-otp', sendLoginOTP);
router.post('/login/verify-otp', verifyLoginOTP);

// ============================================
// REGISTER FLOW (user must NOT exist)
// ============================================
router.post('/register/send-otp', sendRegisterOTP);
router.post('/register/verify-otp', verifyRegisterOTP);
router.post('/register/complete', completeRegistration);

// ============================================
// PROTECTED ROUTES
// ============================================
router.post('/update-profile', authenticateToken, updateProfile);
router.get('/me', authenticateToken, getCurrentUser);

export default router;
