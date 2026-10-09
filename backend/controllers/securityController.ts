import { Request, Response } from 'express';
import { User } from '../models/User.ts';
import { SecurityLog } from '../models/SecurityLog.ts';
import { sendSuccess, sendError } from '../utils/apiResponse.ts';

export const getSecurityStats = async (_req: Request, res: Response) => {
  try {
    const [totalUsers, successfulLogins, failedAttempts, recentLockouts] = await Promise.all([
      User.countDocuments(),
      SecurityLog.countDocuments({ eventType: 'LOGIN_SUCCESS' }),
      SecurityLog.countDocuments({ eventType: 'LOGIN_FAILURE' }),
      SecurityLog.countDocuments({ eventType: 'ACCOUNT_LOCKED' }),
    ]);

    const stats = {
      totalUsers,
      successfulLogins,
      failedAttempts,
      blockedAttacks: recentLockouts, // Will be driven by Phase 3 lockout engine
      systemStatus: 'PROTECTED',
      activeLockouts: 0, // Reserved for Phase 3
      lastScanTime: 'Real-time (MongoDB Live)',
      isRealData: true,
      phase: 2,
    };

    return sendSuccess(res, 'Live security statistics retrieved from MongoDB', stats);
  } catch (error: any) {
    return sendError(res, 'Failed to calculate security telemetry.', 'STATS_QUERY_FAILED', 500);
  }
};

export const getSecurityLogs = async (req: Request, res: Response) => {
  try {
    const limit = parseInt((req.query.limit as string) || '100', 10);
    const eventType = req.query.eventType as string;

    const query: Record<string, any> = {};
    if (eventType) {
      query.eventType = eventType;
    }

    const rawLogs = await SecurityLog.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    // Map logs to format with formatted IDs for UI
    const logs = rawLogs.map((log: any) => ({
      id: log._id.toString(),
      user: log.user,
      eventType: log.eventType,
      status: log.status,
      description: log.description,
      ipAddress: log.ipAddress || '127.0.0.1',
      userAgent: log.userAgent || 'Unknown Client',
      attemptCount: log.attemptCount || 1,
      timestamp: new Date(log.timestamp).toISOString(),
    }));

    return sendSuccess(res, 'Security audit logs retrieved from MongoDB', {
      logs,
      count: logs.length,
      isRealData: true,
      phase: 2,
    });
  } catch (error: any) {
    return sendError(res, 'Failed to retrieve security audit logs.', 'LOGS_QUERY_FAILED', 500);
  }
};

