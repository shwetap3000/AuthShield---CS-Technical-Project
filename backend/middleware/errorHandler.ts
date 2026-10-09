import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse.ts';
import { logger } from '../utils/logger.ts';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error('Unhandled Server Error:', err.stack || err.message || err);

  const statusCode = err.status || err.statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production'
      ? 'An unexpected internal security error occurred.'
      : err.message || 'Internal Server Error';

  return sendError(res, message, 'INTERNAL_SERVER_ERROR', statusCode);
};
