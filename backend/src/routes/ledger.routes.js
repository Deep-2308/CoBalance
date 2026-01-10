import express from 'express';
import {
    createContact,
    getContacts,
    getContactDetail,
    updateContact,
    deleteContact,
    addTransaction,
    getLedgerSummary
} from '../controllers/ledger.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// All ledger routes require authentication
router.use(authenticateToken);

// Contact routes
router.post('/contacts', createContact);
router.get('/contacts', getContacts);
router.get('/contacts/:id', getContactDetail);
router.put('/contacts/:id', updateContact);
router.delete('/contacts/:id', deleteContact);

// Transaction routes
router.post('/transactions', addTransaction);

// Summary
router.get('/summary', getLedgerSummary);

export default router;
