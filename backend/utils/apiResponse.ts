import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  code?: string;
  timestamp: string;
}

export const sendSuccess = <T>(
  res: Response,
  message: string,
  data?: T,
  statusCode = 200
): Response => {
  const payload: ApiResponse<T> = {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
  return res.status(statusCode).json(payload);
};

export const sendError = <T = any>(
  res: Response,
  message: string,
  error?: string,
  statusCode = 400,
  data?: T
): Response => {
  const payload: ApiResponse<T> = {
    success: false,
    message,
    error,
    code: error,
    data,
    timestamp: new Date().toISOString(),
  };
  return res.status(statusCode).json(payload);
};
