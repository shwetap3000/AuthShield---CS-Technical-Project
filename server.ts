import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './backend/config/env.ts';
import { connectDatabase } from './backend/config/db.ts';
import apiRouter from './backend/routes/index.ts';
import { configureSecurityHeaders, requestAuditLogger } from './backend/middleware/securityMiddleware.ts';
import { errorHandler } from './backend/middleware/errorHandler.ts';
import { logger } from './backend/utils/logger.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();

  // Basic security and parsing middlewares
  app.use(configureSecurityHeaders);
  app.use(cors({ origin: true, credentials: true }));
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(requestAuditLogger);

  // Initialize MongoDB connection asynchronously (non-blocking for fast server boot)
  connectDatabase().catch((err) => {
    logger.warn(`Database initialization status: ${err?.message || err}`);
  });

  // Mount API Router under /api
  app.use('/api', apiRouter);

  // In development, hook into Vite's dev server middleware
  if (config.isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    logger.info('Vite development server middleware mounted.');
  } else {
    // In production, serve the built static bundle
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    logger.info(`Serving production static assets from ${distPath}`);
  }

  // Centralized Error Handler
  app.use(errorHandler);

  const server = app.listen(config.port, '0.0.0.0', () => {
    logger.info(`AuthShield Full-Stack Server running on http://0.0.0.0:${config.port}`);
    logger.info(`Health check available at http://0.0.0.0:${config.port}/api/health`);
    logger.info(`Environment: ${config.nodeEnv}`);
  });

  // Graceful shutdown handling
  const shutdown = () => {
    logger.info('Shutting down AuthShield server...');
    server.close(() => {
      logger.info('Server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer().catch((error) => {
  console.error('Fatal startup error in AuthShield server:', error);
  process.exit(1);
});
