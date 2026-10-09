import { SecurityLog, type ISecurityLog, type SecurityEventType, type SecurityEventStatus } from '../models/SecurityLog.ts';
import { logger } from '../utils/logger.ts';

/**
 * Security Audit Logging Service
 * Records real authentication and authorization telemetry to MongoDB.
 * Note: Plaintext passwords and authentication tokens are strictly barred.
 */
export class SecurityLogService {
  /**
   * Log a cybersecurity event directly to MongoDB.
   */
  static async recordEvent(eventData: {
    user: string;
    eventType: SecurityEventType;
    status: SecurityEventStatus;
    description: string;
    ipAddress?: string;
    userAgent?: string;
    attemptCount?: number;
    metadata?: Record<string, any>;
  }): Promise<ISecurityLog | null> {
    logger.security(eventData.eventType, {
      user: eventData.user,
      status: eventData.status,
      ip: eventData.ipAddress,
    });

    try {
      const log = await SecurityLog.create({
        user: eventData.user,
        eventType: eventData.eventType,
        status: eventData.status,
        description: eventData.description,
        ipAddress: eventData.ipAddress || '127.0.0.1',
        userAgent: eventData.userAgent || 'Unknown Client',
        attemptCount: eventData.attemptCount || 1,
        timestamp: new Date(),
        metadata: eventData.metadata || {},
      });
      return log;
    } catch (err: any) {
      logger.error('Failed to persist security audit log to MongoDB:', err.message);
      return null;
    }
  }

  /**
   * Fetch recent security logs with pagination and optional filtering
   */
  static async getRecentLogs(limit = 50, filter: Record<string, any> = {}) {
    try {
      return await SecurityLog.find(filter)
        .sort({ timestamp: -1 })
        .limit(limit)
        .lean();
    } catch (err: any) {
      logger.error('Failed to query security logs from MongoDB:', err.message);
      return [];
    }
  }
}

