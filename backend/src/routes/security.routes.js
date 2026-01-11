import express from 'express';
import { getSessions, logoutSession, logoutAllSessions } from '../controllers/sessions.controller.js';
import { 
    getSecurityOverview, 
    sendEmailVerificationOTP, 
    verifyEmailOTP,
    requestAccountDeletion,
    cancelAccountDeletion
} from '../controllers/security.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// All security routes require authentication
router.use(authenticateToken);

// Security overview
router.get('/overview', getSecurityOverview);

// Sessions management
router.get('/sessions', getSessions);
router.delete('/sessions/:sessionId', logoutSession);
router.post('/sessions/logout-all', logoutAllSessions);

// Email verification
router.post('/email/send-otp', sendEmailVerificationOTP);
router.post('/email/verify-otp', verifyEmailOTP);

// Account deletion
router.post('/account/request-deletion', requestAccountDeletion);
router.post('/account/cancel-deletion', cancelAccountDeletion);

export default router;
