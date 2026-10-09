import { Router } from 'express';
import { getHealth } from '../controllers/healthController.ts';

const router = Router();

// GET /api/health
router.get('/', getHealth);

export default router;
