import { Request, Response } from 'express';
import { User } from '../models/User.ts';
import { SecurityLog } from '../models/SecurityLog.ts';
import { AuthService } from '../services/authService.ts';
import { securityPolicy } from '../config/securityConfig.ts';
import { sendSuccess, sendError } from '../utils/apiResponse.ts';

export const getSecurityStats = async (_req: Request, res: Response) => {
  try {
    const now = new Date();
    const [totalUsers, successfulLogins, failedAttempts, blockedAttacks, activeLockouts] =
      await Promise.all([
        User.countDocuments(),
        SecurityLog.countDocuments({ eventType: 'LOGIN_SUCCESS' }),
        SecurityLog.countDocuments({ eventType: 'LOGIN_FAILURE' }),
        SecurityLog.countDocuments({
          eventType: { $in: ['BRUTE_FORCE_DETECTED', 'BRUTE_FORCE_TRIGGERED', 'ACCOUNT_LOCKED'] },
        }),
        User.countDocuments({
          accountLocked: true,
          lockUntil: { $gt: now },
        }),
      ]);

    const stats = {
      totalUsers,
      successfulLogins,
      failedAttempts,
      blockedAttacks,
      systemStatus: activeLockouts > 0 ? 'ALERT' : 'PROTECTED',
      activeLockouts,
      lastScanTime: 'Real-time (MongoDB Live)',
      isRealData: true,
      phase: 3,
      policy: {
        maxFailedAttempts: securityPolicy.maxFailedAttempts,
        detectionWindowMinutes: securityPolicy.detectionWindowMinutes,
        lockoutDurationMinutes: securityPolicy.lockoutDurationMinutes,
      },
    };

    return sendSuccess(res, 'Live Phase 3 security statistics retrieved from MongoDB', stats);
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
      phase: 3,
    });
  } catch (error: any) {
    return sendError(res, 'Failed to retrieve security audit logs.', 'LOGS_QUERY_FAILED', 500);
  }
};

export const getLockedAccounts = async (_req: Request, res: Response) => {
  try {
    const now = new Date();
    const lockedUsers = await User.find({
      accountLocked: true,
      lockUntil: { $gt: now },
    })
      .select('name email failedLoginAttempts lockUntil createdAt')
      .lean();

    const accounts = lockedUsers.map((u: any) => {
      const lockUntil = new Date(u.lockUntil);
      const remainingMinutes = Math.max(1, Math.ceil((lockUntil.getTime() - now.getTime()) / 60000));
      return {
        id: u._id.toString(),
        name: u.name,
        email: u.email,
        failedLoginAttempts: u.failedLoginAttempts,
        lockUntil: u.lockUntil.toISOString(),
        remainingMinutes,
      };
    });

    return sendSuccess(res, 'Active account lockouts retrieved from MongoDB', accounts);
  } catch (error: any) {
    return sendError(res, 'Failed to fetch locked accounts.', 'LOCKED_ACCOUNTS_QUERY_FAILED', 500);
  }
};

export const unlockAccountHandler = async (req: Request, res: Response) => {
  try {
    const { email, reason } = req.body;
    if (!email) {
      return sendError(res, 'Email address is required to unlock account.', 'VALIDATION_ERROR', 400);
    }

    const result = await AuthService.unlockAccount(
      email,
      reason || 'Administrative analyst console override'
    );
    return sendSuccess(res, result.message, result.user);
  } catch (error: any) {
    const status = error.status || 400;
    return sendError(res, error.message || 'Unable to unlock account.', 'UNLOCK_FAILED', status);
  }
};

export const simulateBruteForceHandler = async (req: Request, res: Response) => {
  try {
    const { email, attempts } = req.body;
    if (!email) {
      return sendError(res, 'Target email address is required.', 'VALIDATION_ERROR', 400);
    }

    const count = parseInt(attempts || '5', 10);
    const result = await AuthService.simulateBruteForceAttack(email, count);

    return sendSuccess(res, result.eventsSummary, result);
  } catch (error: any) {
    const status = error.status || 400;
    return sendError(res, error.message || 'Simulation failed.', 'SIMULATION_ERROR', status);
  }
};

export const getSecurityPolicy = (_req: Request, res: Response) => {
  return sendSuccess(res, 'Active security threshold configuration', {
    maxFailedAttempts: securityPolicy.maxFailedAttempts,
    detectionWindowMinutes: securityPolicy.detectionWindowMinutes,
    lockoutDurationMinutes: securityPolicy.lockoutDurationMinutes,
    rateLimitMaxRequests: securityPolicy.rateLimit.maxRequests,
  });
};

