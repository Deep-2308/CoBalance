import express from 'express';
import {
    getGroupSettlements,
    markSettlementPaid,
    getAllSettlements
} from '../controllers/settlements.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/group/:groupId', getGroupSettlements);
router.post('/mark-paid', markSettlementPaid);
router.get('/all', getAllSettlements);

export default router;
