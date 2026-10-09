import { Router } from 'express';
import { getAuthStatus, register, login, logout, getMe } from '../controllers/authController.ts';
import { requireAuth } from '../middleware/authMiddleware.ts';

const router = Router();

// GET /api/auth/status
router.get('/status', getAuthStatus);

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/me (Protected: returns current user information)
router.get('/me', requireAuth, getMe);

// POST /api/auth/logout (Protected / session invalidation)
router.post('/logout', logout);

export default router;

