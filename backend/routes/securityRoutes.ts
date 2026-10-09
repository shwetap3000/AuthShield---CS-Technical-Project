import { Router } from 'express';
import {
  getSecurityStats,
  getSecurityLogs,
  getLockedAccounts,
  unlockAccountHandler,
  simulateBruteForceHandler,
  getSecurityPolicy,
} from '../controllers/securityController.ts';
import { requireAuth } from '../middleware/authMiddleware.ts';

const router = Router();

// GET /api/security/stats (Protected)
router.get('/stats', requireAuth, getSecurityStats);

// GET /api/security/logs (Protected)
router.get('/logs', requireAuth, getSecurityLogs);

// GET /api/security/policy (Public or Protected)
router.get('/policy', getSecurityPolicy);

// GET /api/security/locked-accounts (Protected)
router.get('/locked-accounts', requireAuth, getLockedAccounts);

// POST /api/security/unlock (Unlocks an account; protected or demo accessible)
router.post('/unlock', unlockAccountHandler);

// POST /api/security/simulate-attack (Simulates failed brute-force attempts for demo)
router.post('/simulate-attack', simulateBruteForceHandler);

export default router;

