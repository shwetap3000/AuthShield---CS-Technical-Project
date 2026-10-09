import { Request, Response } from 'express';
import { AuthService, toSafeUser } from '../services/authService.ts';
import { SecurityLogService } from '../services/securityLogService.ts';
import { sendSuccess, sendError } from '../utils/apiResponse.ts';
import { AuthenticatedRequest } from '../middleware/authMiddleware.ts';
import { config } from '../config/env.ts';

const setAuthCookie = (res: Response, token: string) => {
  res.cookie('auth_token', token, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/',
  });
};

const clearAuthCookie = (res: Response) => {
  res.clearCookie('auth_token', {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'lax',
    path: '/',
  });
};

export const getAuthStatus = (_req: Request, res: Response) => {
  return sendSuccess(res, 'AuthShield Authentication Service Initialized', {
    phase: 'Phase 2 - Real Authentication System Active',
    hashingEngine: 'bcryptjs (10 rounds)',
    tokenStrategy: 'Signed JWT with HTTP-only Cookies & Bearer fallback',
    securityLogging: 'Active MongoDB Audit Logging',
  });
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    const result = await AuthService.registerUser({
      name,
      email,
      password,
      confirmPassword,
    });

    // Set secure HTTP-only cookie
    setAuthCookie(res, result.token);

    // Also record registration audit event
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown';
    await SecurityLogService.recordEvent({
      user: result.user.email,
      eventType: 'LOGIN_SUCCESS',
      status: 'SUCCESS',
      description: 'New account registered and initial session established.',
      ipAddress: String(ip),
      userAgent: String(userAgent),
      attemptCount: 1,
    });

    return sendSuccess(
      res,
      'User account registered successfully.',
      {
        user: result.user,
        token: result.token,
      },
      201
    );
  } catch (err: any) {
    const statusCode = err.status || 400;
    const message = err.message || 'Unable to complete registration.';
    return sendError(res, message, 'REGISTRATION_ERROR', statusCode);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown';

    const result = await AuthService.authenticateUser(email, password, {
      ip: String(ip),
      userAgent: String(userAgent),
    });

    // Set secure HTTP-only cookie
    setAuthCookie(res, result.token);

    return sendSuccess(res, 'Authentication successful.', {
      user: result.user,
      token: result.token,
    });
  } catch (err: any) {
    const statusCode = err.status || 401;
    const message = err.message || 'Invalid email or password.';
    return sendError(res, message, 'AUTH_FAILED', statusCode);
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 'UNAUTHORIZED', 401);
  }

  return sendSuccess(res, 'Authenticated user profile retrieved.', {
    user: toSafeUser(req.user),
  });
};

export const logout = async (req: AuthenticatedRequest, res: Response) => {
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || 'Unknown';

  if (req.user) {
    await SecurityLogService.recordEvent({
      user: req.user.email,
      eventType: 'LOGOUT',
      status: 'SUCCESS',
      description: 'User initiated session logout. Authentication credentials cleared.',
      ipAddress: String(ip),
      userAgent: String(userAgent),
      attemptCount: 1,
    });
  }

  clearAuthCookie(res);
  return sendSuccess(res, 'Session terminated successfully. Logged out.');
};

