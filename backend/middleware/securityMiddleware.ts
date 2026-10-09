import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';

// Security headers middleware using Helmet
export const configureSecurityHeaders = helmet({
  // Disable CSP in development so Vite scripts, HMR, and inline dev styles are not blocked
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
});

// Request audit logging middleware for cybersecurity demonstration
export const requestAuditLogger = (req: Request, _res: Response, next: NextFunction) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const method = req.method;
  const path = req.path;
  const userAgent = req.headers['user-agent'] || 'Unknown';

  // Log incoming API calls
  if (path.startsWith('/api')) {
    console.log(`[HTTP-AUDIT] ${method} ${path} | IP: ${ip} | UA: ${userAgent.slice(0, 40)}`);
  }

  next();
};
