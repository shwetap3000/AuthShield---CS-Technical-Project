import { Request, Response } from 'express';
import { getDbState } from '../config/db.ts';
import { sendSuccess } from '../utils/apiResponse.ts';

export const getHealth = (_req: Request, res: Response) => {
  const dbState = getDbState();

  const healthData = {
    system: 'AuthShield – Secure Authentication & Brute-Force Detection System',
    version: '3.0.0-phase3',
    status: 'OPERATIONAL',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: dbState.state,
      connected: dbState.isConnected,
      configured: dbState.uriConfigured,
      mode: dbState.mode,
      driver: 'Mongoose / MongoDB',
    },
    modules: {
      authentication: 'Active (bcryptjs salted hashing + JWT session token)',
      bruteForceDetection: 'Active (5-attempt rolling threshold with automatic 15-minute account lockout)',
      securityAuditLogging: 'Active (MongoDB SecurityLog collection with real-time anomaly tracking)',
    },
  };

  return sendSuccess(res, 'AuthShield API is healthy and operational', healthData);
};
