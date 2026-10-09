/**
 * Standard API Logger for AuthShield backend
 */
export const logger = {
  info: (message: string, meta?: any) => {
    console.log(`[AUTHSHIELD-INFO] [${new Date().toISOString()}] ${message}`, meta ? meta : '');
  },
  warn: (message: string, meta?: any) => {
    console.warn(`[AUTHSHIELD-WARN] [${new Date().toISOString()}] ${message}`, meta ? meta : '');
  },
  error: (message: string, meta?: any) => {
    console.error(`[AUTHSHIELD-ERROR] [${new Date().toISOString()}] ${message}`, meta ? meta : '');
  },
  security: (event: string, meta?: any) => {
    console.log(`[AUTHSHIELD-SECURITY] [${new Date().toISOString()}] [EVENT: ${event}]`, meta ? meta : '');
  },
};
