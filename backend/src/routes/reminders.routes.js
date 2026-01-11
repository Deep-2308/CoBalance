import express from 'express';
import { 
    generateReminder, 
    logReminder, 
    getContactReminders, 
    getGroupMemberReminders,
    getLastContactReminder 
} from '../controllers/reminders.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticateToken);

// Generate WhatsApp link (existing)
router.post('/generate', generateReminder);

// Log a sent reminder
router.post('/log', logReminder);

// Get reminder history for a contact
router.get('/contact/:contactId', getContactReminders);

// Get last reminder for a contact
router.get('/contact/:contactId/last', getLastContactReminder);

// Get reminder history for a group member
router.get('/group/:groupId/member/:targetUserId', getGroupMemberReminders);

export default router;
