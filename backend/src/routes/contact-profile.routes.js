/**
 * Contact Profile Routes
 */

import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { getContactProfile, settleContactBalance } from '../controllers/contact-profile.controller.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get unified contact profile (ledger + groups)
router.get('/:contactId/profile', getContactProfile);

// Settle total balance with contact
router.post('/:contactId/settle', settleContactBalance);

export default router;
