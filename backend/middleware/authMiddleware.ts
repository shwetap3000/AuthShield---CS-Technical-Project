import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.ts';
import { User, IUser } from '../models/User.ts';
import { sendError } from '../utils/apiResponse.ts';

// Extend Express Request type to include user
export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. Extract token from HTTP-only cookie or Bearer Authorization header
    let token = req.cookies?.auth_token;

    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && /^Bearer$/i.test(parts[0])) {
        token = parts[1];
      }
    }

    if (!token) {
      return sendError(
        res,
        'Authentication required: Please sign in to access this resource.',
        'UNAUTHORIZED',
        401
      );
    }

    // 2. Verify JWT signature
    let decoded: any;
    try {
      decoded = jwt.verify(token, config.jwtSecret);
    } catch (jwtErr: any) {
      // Clear invalid cookie if present
      res.clearCookie('auth_token', {
        httpOnly: true,
        sameSite: 'lax',
        secure: config.nodeEnv === 'production',
        path: '/',
      });
      return sendError(
        res,
        'Invalid or expired session token. Please log in again.',
        'TOKEN_EXPIRED_OR_INVALID',
        401
      );
    }

    // 3. Find user in MongoDB (exclude passwordHash)
    const user = await User.findById(decoded.id);
    if (!user) {
      return sendError(
        res,
        'User account associated with this session no longer exists.',
        'USER_NOT_FOUND',
        401
      );
    }

    // 4. Attach authenticated user to request
    req.user = user;
    next();
  } catch (error: any) {
    return sendError(
      res,
      'Internal error validating authentication status.',
      'AUTH_INTERNAL_ERROR',
      500
    );
  }
};

