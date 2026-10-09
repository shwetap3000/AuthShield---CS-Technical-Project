import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, type IUser } from '../models/User.ts';
import { config } from '../config/env.ts';
import { SecurityLogService } from './securityLogService.ts';
import { logger } from '../utils/logger.ts';

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: string;
  accountStatus: 'ACTIVE' | 'LOCKED';
  failedLoginAttempts: number;
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
   * Verify credentials, update login telemetry, and issue session token
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

    // Find user in MongoDB and explicitly select passwordHash
    const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');

    if (!user) {
      // Record failed login audit log (Identity unknown)
      await SecurityLogService.recordEvent({
        user: normalizedEmail,
        eventType: 'LOGIN_FAILURE',
        status: 'FAILED',
        description: `Authentication failed: Account not found for ${normalizedEmail}.`,
        ipAddress: reqMeta.ip,
        userAgent: reqMeta.userAgent,
        attemptCount: 1,
      });

      throw { status: 401, message: 'Invalid email or password.' };
    }

    // Compare submitted password against stored bcrypt hash
    const isPasswordValid = await bcrypt.compare(passwordPlain, user.passwordHash);

    if (!isPasswordValid) {
      // Increment failed attempt counter (kept ready for Phase 3 brute-force lockout)
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      await user.save();

      // Record failed login attempt in SecurityLog
      await SecurityLogService.recordEvent({
        user: user.email,
        eventType: 'LOGIN_FAILURE',
        status: 'FAILED',
        description: `Authentication failed: Invalid password provided. Consecutive failure count: ${user.failedLoginAttempts}.`,
        ipAddress: reqMeta.ip,
        userAgent: reqMeta.userAgent,
        attemptCount: user.failedLoginAttempts,
      });

      throw { status: 401, message: 'Invalid email or password.' };
    }

    // Success: Reset failed attempts counter and update lastLogin
    user.failedLoginAttempts = 0;
    user.lastLogin = new Date();
    await user.save();

    // Record successful login in SecurityLog
    await SecurityLogService.recordEvent({
      user: user.email,
      eventType: 'LOGIN_SUCCESS',
      status: 'SUCCESS',
      description: 'Credentials verified successfully via bcrypt comparison. Session established.',
      ipAddress: reqMeta.ip,
      userAgent: reqMeta.userAgent,
      attemptCount: 1,
    });

    const safeUser = toSafeUser(user);
    const token = generateAuthToken(user);

    return { user: safeUser, token };
  }
}

