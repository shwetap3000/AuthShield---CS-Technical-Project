import { Router } from 'express';
import { getSecurityStats, getSecurityLogs } from '../controllers/securityController.ts';
import { requireAuth } from '../middleware/authMiddleware.ts';

const router = Router();

// GET /api/security/stats (Protected)
router.get('/stats', requireAuth, getSecurityStats);

// GET /api/security/logs (Protected)
router.get('/logs', requireAuth, getSecurityLogs);

export default router;

