import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/authshield',
  sessionSecret: process.env.SESSION_SECRET || 'dev-session-secret-change-in-production',
  jwtSecret: process.env.JWT_SECRET || 'dev-jwt-secret-change-in-production',
  isDev: (process.env.NODE_ENV || 'development') !== 'production',
  maxFailedAttempts: parseInt(process.env.AUTH_MAX_FAILED_ATTEMPTS || '5', 10),
  windowMinutes: parseInt(process.env.AUTH_WINDOW_MINUTES || '15', 10),
  lockoutMinutes: parseInt(process.env.AUTH_LOCKOUT_MINUTES || '15', 10),
};
