import express from 'express';
import {
    createGroup,
    getGroups,
    getGroupDetail,
    updateGroup,
    deleteGroup,
    addMember,
    removeMember,
    addExpense,
    getGroupBalances
} from '../controllers/groups.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// All group routes require authentication
router.use(authenticateToken);

// Group routes
router.post('/', createGroup);
router.get('/', getGroups);
router.get('/:id', getGroupDetail);
router.put('/:id', updateGroup);
router.delete('/:id', deleteGroup);

// Member routes
router.post('/:id/members', addMember);
router.delete('/:id/members/:userId', removeMember);

// Expense routes
router.post('/:id/expenses', addExpense);
router.get('/:id/balances', getGroupBalances);

export default router;
