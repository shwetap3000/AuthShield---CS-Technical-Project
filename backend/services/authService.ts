import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, type IUser } from '../models/User.ts';
import { config } from '../config/env.ts';
import { securityPolicy } from '../config/securityConfig.ts';
import { SecurityLogService } from './securityLogService.ts';
import { logger } from '../utils/logger.ts';

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: string;
  accountStatus: 'ACTIVE' | 'LOCKED';
  failedLoginAttempts: number;
  lockUntil: Date | null;
  lastLogin: Date | null;
  createdAt: Date;
}

export function toSafeUser(user: IUser): SafeUser {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    accountStatus: user.accountLocked ? 'LOCKED' : 'ACTIVE',
    failedLoginAttempts: user.failedLoginAttempts || 0,
    lockUntil: user.lockUntil,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
  };
}

export function generateAuthToken(user: IUser): string {
  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    },
    config.jwtSecret,
    { expiresIn: '24h' }
  );
}

export class AuthService {
  /**
   * Enforce password security policy
   */
  static validatePasswordPolicy(password: string): { isValid: boolean; reason?: string } {
    if (!password || password.length < 8) {
      return { isValid: false, reason: 'Password must be at least 8 characters long.' };
    }
    if (!/[a-z]/.test(password)) {
      return { isValid: false, reason: 'Password must contain at least one lowercase letter (a-z).' };
    }
    if (!/[A-Z]/.test(password)) {
      return { isValid: false, reason: 'Password must contain at least one uppercase letter (A-Z).' };
    }
    if (!/[0-9]/.test(password)) {
      return { isValid: false, reason: 'Password must contain at least one numeric digit (0-9).' };
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      return { isValid: false, reason: 'Password must contain at least one special character (!@#$%^&*).' };
    }
    return { isValid: true };
  }

  /**
   * Register a new user with bcrypt password hashing
   */
  static async registerUser(data: {
    name: string;
    email: string;
    password: string;
    confirmPassword?: string;
  }): Promise<{ user: SafeUser; token: string }> {
    const { name, email, password, confirmPassword } = data;

    // 1. Validation
    if (!name || name.trim().length < 2) {
      throw { status: 400, message: 'Please provide a valid full name (minimum 2 characters).' };
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!email || !emailRegex.test(email)) {
      throw { status: 400, message: 'Please provide a valid email address.' };
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      throw { status: 400, message: 'Password and confirmation password do not match.' };
    }

    const policy = this.validatePasswordPolicy(password);
    if (!policy.isValid) {
      throw { status: 400, message: policy.reason };
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 2. Duplicate account check
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw { status: 409, message: 'An account with this email address already exists.' };
    }

    // 3. Hash password using bcrypt (10 rounds standard for security and responsiveness)
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 4. Create user in MongoDB with initialized security fields
    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash, // ONLY hash is stored; plaintext is discarded
      failedLoginAttempts: 0,
      firstFailedLoginAt: null,
      lastFailedLoginAt: null,
      accountLocked: false,
      lockUntil: null,
      lastLogin: null,
    });

    logger.info(`User registered successfully in MongoDB: ${normalizedEmail}`);

    const safeUser = toSafeUser(newUser);
    const token = generateAuthToken(newUser);

    return { user: safeUser, token };
  }

  /**
   * Verify credentials, enforce brute-force detection & rolling account lockout,
   * update login telemetry, and issue session token.
   */
  static async authenticateUser(
    email: string,
    passwordPlain: string,
    reqMeta: { ip: string; userAgent: string }
  ): Promise<{ user: SafeUser; token: string }> {
    if (!email || !passwordPlain) {
      throw { status: 400, message: 'Please provide both email and password.' };
    }

    const normalizedEmail = email.trim().toLowerCase();
    const now = new Date();

    // Find user in MongoDB and explicitly select passwordHash
    const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');

    if (!user) {
      // Record failed login audit log (Identity unknown)
      await SecurityLogService.recordEvent({
        user: normalizedEmail,
        eventType: 'LOGIN_FAILURE',
        status: 'FAILED',
        description: `Authentication failed: Identity not found for ${normalizedEmail}.`,
        ipAddress: reqMeta.ip,
        userAgent: reqMeta.userAgent,
        attemptCount: 1,
      });

      // Generic error response to prevent user enumeration
      throw { status: 401, code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' };
    }

    // Check account lockout status before attempting password verification
    if (user.accountLocked && user.lockUntil) {
      if (user.lockUntil > now) {
        // Lockout is still active! Reject login even if correct password is provided
        const remainingMinutes = Math.max(1, Math.ceil((user.lockUntil.getTime() - now.getTime()) / 60000));
        logger.warn(`Login rejected: Account ${user.email} is locked for ${remainingMinutes} more minute(s).`);

        // Record a blocked attempt log for the locked account
        await SecurityLogService.recordEvent({
          user: user.email,
          eventType: 'ACCOUNT_LOCKED',
          status: 'BLOCKED',
          description: `Login rejected: Account is locked due to prior brute-force detection. Remaining duration: ~${remainingMinutes} min.`,
          ipAddress: reqMeta.ip,
          userAgent: reqMeta.userAgent,
          attemptCount: user.failedLoginAttempts,
        });

        throw {
          status: 423,
          code: 'ACCOUNT_LOCKED',
          message: 'Your account is temporarily locked due to repeated failed login attempts. Please try again after the lockout period.',
          lockUntil: user.lockUntil.toISOString(),
        };
      } else {
        // Lockout period has elapsed: automatically unlock the account
        await User.updateOne(
          { _id: user._id },
          {
            $set: {
              accountLocked: false,
              lockUntil: null,
              failedLoginAttempts: 0,
              firstFailedLoginAt: null,
              lastFailedLoginAt: null,
            },
          }
        );

        user.accountLocked = false;
        user.lockUntil = null;
        user.failedLoginAttempts = 0;
        user.firstFailedLoginAt = null;
        user.lastFailedLoginAt = null;

        await SecurityLogService.recordEvent({
          user: user.email,
          eventType: 'ACCOUNT_UNLOCKED',
          status: 'SUCCESS',
          description: 'Lockout duration elapsed. Account unlocked automatically.',
          ipAddress: reqMeta.ip,
          userAgent: reqMeta.userAgent,
          attemptCount: 0,
        });

        logger.info(`Account automatically unlocked after expiry: ${user.email}`);
      }
    }

    // Compare submitted password against stored bcrypt hash
    const isPasswordValid = await bcrypt.compare(passwordPlain, user.passwordHash);

    if (!isPasswordValid) {
      // Manage rolling detection window (15 minutes)
      let currentAttempts = user.failedLoginAttempts || 0;
      let windowStart = user.firstFailedLoginAt;

      if (!windowStart || now.getTime() - windowStart.getTime() > securityPolicy.detectionWindowMs) {
        // Window expired or new sequence: start fresh failure window
        windowStart = now;
        currentAttempts = 1;
      } else {
        // Within rolling 15-minute window
        currentAttempts += 1;
      }

      // Check if maximum failure threshold is reached (5 failed attempts)
      if (currentAttempts >= securityPolicy.maxFailedAttempts) {
        const lockoutExpiry = new Date(now.getTime() + securityPolicy.lockoutDurationMs);

        // Atomic lock transition in MongoDB
        await User.updateOne(
          { _id: user._id },
          {
            $set: {
              accountLocked: true,
              lockUntil: lockoutExpiry,
              failedLoginAttempts: currentAttempts,
              firstFailedLoginAt: windowStart,
              lastFailedLoginAt: now,
            },
          }
        );

        // 1. Record BRUTE_FORCE_DETECTED security event
        await SecurityLogService.recordEvent({
          user: user.email,
          eventType: 'BRUTE_FORCE_DETECTED',
          status: 'BLOCKED',
          description: `Brute-force attack detected: ${currentAttempts} consecutive failed attempts within ${securityPolicy.detectionWindowMinutes} minutes. Lockout enforced.`,
          ipAddress: reqMeta.ip,
          userAgent: reqMeta.userAgent,
          attemptCount: currentAttempts,
        });

        // 2. Record ACCOUNT_LOCKED security event
        await SecurityLogService.recordEvent({
          user: user.email,
          eventType: 'ACCOUNT_LOCKED',
          status: 'BLOCKED',
          description: `Defense policy activated: Account temporarily locked for ${securityPolicy.lockoutDurationMinutes} minutes.`,
          ipAddress: reqMeta.ip,
          userAgent: reqMeta.userAgent,
          attemptCount: currentAttempts,
        });

        logger.security('BRUTE_FORCE_DETECTED', { user: user.email, attempts: currentAttempts });

        throw {
          status: 423,
          code: 'ACCOUNT_LOCKED',
          message: `Your account is temporarily locked due to repeated failed login attempts (${currentAttempts}/${securityPolicy.maxFailedAttempts}). Please try again in ${securityPolicy.lockoutDurationMinutes} minutes.`,
          lockUntil: lockoutExpiry.toISOString(),
          attempts: currentAttempts,
          maxAttempts: securityPolicy.maxFailedAttempts,
          remainingAttempts: 0,
        };
      } else {
        // Increment counter for attempts below threshold (1 to 4)
        await User.updateOne(
          { _id: user._id },
          {
            $set: {
              failedLoginAttempts: currentAttempts,
              firstFailedLoginAt: windowStart,
              lastFailedLoginAt: now,
            },
          }
        );

        // Record standard LOGIN_FAILURE event
        await SecurityLogService.recordEvent({
          user: user.email,
          eventType: 'LOGIN_FAILURE',
          status: 'FAILED',
          description: `Authentication failed: Invalid credentials provided. Attempt ${currentAttempts} of ${securityPolicy.maxFailedAttempts}.`,
          ipAddress: reqMeta.ip,
          userAgent: reqMeta.userAgent,
          attemptCount: currentAttempts,
        });

        throw {
          status: 401,
          code: 'INVALID_CREDENTIALS',
          message: `Invalid email or password. Attempt ${currentAttempts} of ${securityPolicy.maxFailedAttempts}.`,
          attempts: currentAttempts,
          maxAttempts: securityPolicy.maxFailedAttempts,
          remainingAttempts: securityPolicy.maxFailedAttempts - currentAttempts,
        };
      }
    }

    // Successful login: reset failed attempts counter & failure-window state
    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          failedLoginAttempts: 0,
          firstFailedLoginAt: null,
          lastFailedLoginAt: null,
          accountLocked: false,
          lockUntil: null,
          lastLogin: now,
        },
      }
    );

    // Record LOGIN_SUCCESS event
    await SecurityLogService.recordEvent({
      user: user.email,
      eventType: 'LOGIN_SUCCESS',
      status: 'SUCCESS',
      description: 'Credentials verified successfully via bcrypt comparison. Session established.',
      ipAddress: reqMeta.ip,
      userAgent: reqMeta.userAgent,
      attemptCount: 1,
    });

    user.failedLoginAttempts = 0;
    user.lastLogin = now;
    user.accountLocked = false;
    user.lockUntil = null;

    const safeUser = toSafeUser(user);
    const token = generateAuthToken(user);

    return { user: safeUser, token };
  }

  /**
   * Administrative / Demo Manual Unlock of an account
   */
  static async unlockAccount(
    email: string,
    reason = 'Administrative security analyst unlock'
  ): Promise<{ success: boolean; message: string; user?: SafeUser }> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      throw { status: 404, message: `Account ${normalizedEmail} does not exist.` };
    }

    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          accountLocked: false,
          lockUntil: null,
          failedLoginAttempts: 0,
          firstFailedLoginAt: null,
          lastFailedLoginAt: null,
        },
      }
    );

    user.accountLocked = false;
    user.lockUntil = null;
    user.failedLoginAttempts = 0;
    user.firstFailedLoginAt = null;
    user.lastFailedLoginAt = null;

    await SecurityLogService.recordEvent({
      user: user.email,
      eventType: 'ACCOUNT_UNLOCKED',
      status: 'SUCCESS',
      description: `${reason}: Lockout state manually removed and failure counter reset.`,
      ipAddress: '127.0.0.1',
      userAgent: 'AuthShield Security Management Console',
      attemptCount: 0,
    });

    logger.info(`Account manually unlocked: ${user.email} (${reason})`);

    return {
      success: true,
      message: `Account ${user.email} has been unlocked and security lockout cleared.`,
      user: toSafeUser(user),
    };
  }

  /**
   * College Cybersecurity Project Demo:
   * Simulate a Brute-Force attack against a target account to demonstrate detection & lockout.
   */
  static async simulateBruteForceAttack(
    targetEmail: string,
    count: number = 5
  ): Promise<{
    target: string;
    attemptsSimulated: number;
    lockedOut: boolean;
    lockUntil?: string;
    eventsSummary: string;
  }> {
    const normalizedEmail = targetEmail.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      throw { status: 404, message: `Cannot simulate attack: account ${normalizedEmail} does not exist.` };
    }

    const attackerIp = '198.51.100.42'; // RFC 5737 TEST-NET-2 adversary simulation
    const attackerUserAgent = 'Hydra/v9.5 Brute-Force Bot (Simulated)';
    const now = new Date();

    // Reset before running the sequence if user was already in another state
    let attempts = 0;
    for (let i = 1; i <= count; i++) {
      attempts = i;
      if (i < securityPolicy.maxFailedAttempts) {
        // Record intermediate failure
        await SecurityLogService.recordEvent({
          user: user.email,
          eventType: 'LOGIN_FAILURE',
          status: 'FAILED',
          description: `Simulated brute-force attempt #${i}: Bad password dictionary guessing.`,
          ipAddress: attackerIp,
          userAgent: attackerUserAgent,
          attemptCount: i,
        });
      } else {
        // Reached lockout threshold (attempt 5)
        const lockoutExpiry = new Date(now.getTime() + securityPolicy.lockoutDurationMs);
        await User.updateOne(
          { _id: user._id },
          {
            $set: {
              accountLocked: true,
              lockUntil: lockoutExpiry,
              failedLoginAttempts: i,
              firstFailedLoginAt: now,
              lastFailedLoginAt: now,
            },
          }
        );

        await SecurityLogService.recordEvent({
          user: user.email,
          eventType: 'BRUTE_FORCE_DETECTED',
          status: 'BLOCKED',
          description: `Brute-force attack detected: ${i} rapid failed attempts detected from ${attackerIp}. Defenses engaged.`,
          ipAddress: attackerIp,
          userAgent: attackerUserAgent,
          attemptCount: i,
        });

        await SecurityLogService.recordEvent({
          user: user.email,
          eventType: 'ACCOUNT_LOCKED',
          status: 'BLOCKED',
          description: `Defense policy activated: Account temporarily locked for ${securityPolicy.lockoutDurationMinutes} minutes.`,
          ipAddress: attackerIp,
          userAgent: attackerUserAgent,
          attemptCount: i,
        });

        return {
          target: user.email,
          attemptsSimulated: i,
          lockedOut: true,
          lockUntil: lockoutExpiry.toISOString(),
          eventsSummary: `Simulated ${i} failed logins. BRUTE_FORCE_DETECTED and ACCOUNT_LOCKED events recorded in MongoDB.`,
        };
      }
    }

    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          failedLoginAttempts: attempts,
          firstFailedLoginAt: now,
          lastFailedLoginAt: now,
        },
      }
    );

    return {
      target: user.email,
      attemptsSimulated: attempts,
      lockedOut: false,
      eventsSummary: `Simulated ${attempts} failed attempts. Account remains active (threshold is ${securityPolicy.maxFailedAttempts}).`,
    };
  }
}


