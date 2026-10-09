import { Request, Response } from 'express';
import { getDbState } from '../config/db.ts';
import { sendSuccess } from '../utils/apiResponse.ts';

export const getHealth = (_req: Request, res: Response) => {
  const dbState = getDbState();

  const healthData = {
    system: 'AuthShield – Secure Authentication & Brute-Force Detection System',
    version: '2.0.0-phase2',
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
      authentication: 'Active (bcryptjs password hashing + JWT session token)',
      bruteForceDetection: 'Failure Counter Active (Phase 3 Lockout Engine Pending)',
      securityAuditLogging: 'Active (MongoDB SecurityLog Collection)',
    },
  };

  return sendSuccess(res, 'AuthShield API is healthy and operational', healthData);
};
