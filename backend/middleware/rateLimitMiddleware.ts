import rateLimit from 'express-rate-limit';
import { securityPolicy } from '../config/securityConfig.ts';
import { sendError } from '../utils/apiResponse.ts';

export const loginRateLimiter = rateLimit({
  windowMs: securityPolicy.rateLimit.windowMs,
  max: securityPolicy.rateLimit.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    return sendError(
      res,
      securityPolicy.rateLimit.message,
      'RATE_LIMIT_EXCEEDED',
      429
    );
  },
});

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    return sendError(
      res,
      'Request rate limit exceeded. Please wait before making more requests.',
      'RATE_LIMIT_EXCEEDED',
      429
    );
  },
});
