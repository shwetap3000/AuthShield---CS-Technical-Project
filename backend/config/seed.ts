import bcrypt from 'bcryptjs';
import { User } from '../models/User.ts';
import { SecurityLog } from '../models/SecurityLog.ts';
import { logger } from '../utils/logger.ts';

export async function seedInitialData() {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      return;
    }

    logger.info('Initializing sample cybersecurity research accounts and baseline telemetry...');

    const saltRounds = 10;
    const defaultPasswordHash = await bcrypt.hash('Password123!', saltRounds);

    const now = new Date();
    const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000);

    // 1. Primary Security Analyst
    await User.create({
      name: 'Alex Vance',
      email: 'analyst@cyber.edu',
      passwordHash: defaultPasswordHash,
      failedLoginAttempts: 0,
      accountLocked: false,
      lockUntil: null,
      lastLogin: new Date(now.getTime() - 25 * 60 * 1000),
      role: 'security_analyst',
    });

    // 2. Normal Student / User
    await User.create({
      name: 'Sarah Connor',
      email: 'student@cyber.edu',
      passwordHash: defaultPasswordHash,
      failedLoginAttempts: 1,
      accountLocked: false,
      lockUntil: null,
      lastLogin: new Date(now.getTime() - 120 * 60 * 1000),
      role: 'user',
    });

    // 3. Pre-locked Account for immediate Phase 3 lockout demonstration
    await User.create({
      name: 'Test Target Account',
      email: 'target@cyber.edu',
      passwordHash: defaultPasswordHash,
      failedLoginAttempts: 5,
      firstFailedLoginAt: new Date(now.getTime() - 5 * 60 * 1000),
      lastFailedLoginAt: new Date(now.getTime() - 3 * 60 * 1000),
      accountLocked: true,
      lockUntil: tenMinutesFromNow,
      lastLogin: new Date(now.getTime() - 240 * 60 * 1000),
      role: 'user',
    });

    // Seed baseline Security Logs
    await SecurityLog.create([
      {
        user: 'analyst@cyber.edu',
        eventType: 'LOGIN_SUCCESS',
        status: 'SUCCESS',
        description: 'Session authenticated via bcrypt comparison and JWT cookie issuance.',
        ipAddress: '192.168.1.105',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        attemptCount: 1,
        timestamp: new Date(now.getTime() - 25 * 60 * 1000),
      },
      {
        user: 'target@cyber.edu',
        eventType: 'LOGIN_FAILURE',
        status: 'FAILED',
        description: 'Authentication failed: Invalid credentials provided. Attempt 1 of 5.',
        ipAddress: '198.51.100.42',
        userAgent: 'Hydra/v9.5 Automated Attacker',
        attemptCount: 1,
        timestamp: new Date(now.getTime() - 5 * 60 * 1000),
      },
      {
        user: 'target@cyber.edu',
        eventType: 'LOGIN_FAILURE',
        status: 'FAILED',
        description: 'Authentication failed: Invalid credentials provided. Attempt 2 of 5.',
        ipAddress: '198.51.100.42',
        userAgent: 'Hydra/v9.5 Automated Attacker',
        attemptCount: 2,
        timestamp: new Date(now.getTime() - 4 * 60 * 1000),
      },
      {
        user: 'target@cyber.edu',
        eventType: 'LOGIN_FAILURE',
        status: 'FAILED',
        description: 'Authentication failed: Invalid credentials provided. Attempt 3 of 5.',
        ipAddress: '198.51.100.42',
        userAgent: 'Hydra/v9.5 Automated Attacker',
        attemptCount: 3,
        timestamp: new Date(now.getTime() - 3.5 * 60 * 1000),
      },
      {
        user: 'target@cyber.edu',
        eventType: 'LOGIN_FAILURE',
        status: 'FAILED',
        description: 'Authentication failed: Invalid credentials provided. Attempt 4 of 5.',
        ipAddress: '198.51.100.42',
        userAgent: 'Hydra/v9.5 Automated Attacker',
        attemptCount: 4,
        timestamp: new Date(now.getTime() - 3.2 * 60 * 1000),
      },
      {
        user: 'target@cyber.edu',
        eventType: 'BRUTE_FORCE_DETECTED',
        status: 'BLOCKED',
        description: 'Brute-force attack detected: 5 rapid failed attempts detected within 15 minutes. Defenses engaged.',
        ipAddress: '198.51.100.42',
        userAgent: 'Hydra/v9.5 Automated Attacker',
        attemptCount: 5,
        timestamp: new Date(now.getTime() - 3 * 60 * 1000),
      },
      {
        user: 'target@cyber.edu',
        eventType: 'ACCOUNT_LOCKED',
        status: 'BLOCKED',
        description: 'Defense policy activated: Account temporarily locked for 15 minutes.',
        ipAddress: '198.51.100.42',
        userAgent: 'Hydra/v9.5 Automated Attacker',
        attemptCount: 5,
        timestamp: new Date(now.getTime() - 3 * 60 * 1000),
      },
    ]);

    logger.info('Sample accounts (analyst@cyber.edu, student@cyber.edu, target@cyber.edu) and initial telemetry seeded.');
  } catch (err: any) {
    logger.warn('Seed initialization error:', err.message);
  }
}
