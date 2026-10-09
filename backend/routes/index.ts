import { Router } from 'express';
import healthRoutes from './healthRoutes.ts';
import authRoutes from './authRoutes.ts';
import securityRoutes from './securityRoutes.ts';

const apiRouter = Router();

// Mount subroutes
apiRouter.use('/health', healthRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/security', securityRoutes);

export default apiRouter;
