import { config } from './env.ts';

export const securityPolicy = {
  // Brute-force detection threshold
  maxFailedAttempts: parseInt(process.env.AUTH_MAX_FAILED_ATTEMPTS || '5', 10),

  // Rolling failure detection window (15 minutes in milliseconds)
  detectionWindowMinutes: parseInt(process.env.AUTH_WINDOW_MINUTES || '15', 10),
  get detectionWindowMs(): number {
    return this.detectionWindowMinutes * 60 * 1000;
  },

  // Account lockout duration (15 minutes in milliseconds)
  lockoutDurationMinutes: parseInt(process.env.AUTH_LOCKOUT_MINUTES || '15', 10),
  get lockoutDurationMs(): number {
    return this.lockoutDurationMinutes * 60 * 1000;
  },

  // IP-level request rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_LOGIN_MAX || '60', 10), // 60 requests per 15 min per IP
    message: 'Too many login requests. Please wait before trying again.',
  },
};
