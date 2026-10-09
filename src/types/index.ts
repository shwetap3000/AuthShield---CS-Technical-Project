export type EventStatus = 'SUCCESS' | 'FAILED' | 'WARNING' | 'BLOCKED';

export type EventType =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILURE'
  | 'BRUTE_FORCE_TRIGGERED'
  | 'ACCOUNT_LOCKED'
  | 'SUSPICIOUS_IP_DETECTED'
  | 'PASSWORD_RESET_REQUESTED'
  | 'LOGOUT';

export interface SecurityEvent {
  id: string;
  user: string;
  eventType: EventType;
  status: EventStatus;
  description: string;
  ipAddress: string;
  userAgent: string;
  attemptCount: number;
  timestamp: string;
}

export interface SecurityStatistics {
  totalUsers: number;
  successfulLogins: number;
  failedAttempts: number;
  blockedAttacks: number;
  systemStatus: string;
  activeLockouts: number;
  lastScanTime: string;
}

export interface LoginActivityItem {
  id: string;
  user: string;
  timestamp: string;
  status: 'SUCCESS' | 'FAILED' | 'BLOCKED';
  ipAddress: string;
  device: string;
  browser: string;
  location: string;
  eventType: EventType;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  accountStatus: 'ACTIVE' | 'LOCKED';
  failedLoginAttempts: number;
  lastLogin: string | null;
  createdAt: string;
}

export interface UserProfileData {
  name: string;
  email: string;
  role: string;
  accountStatus: 'ACTIVE' | 'LOCKED' | 'PENDING';
  lastLogin: string;
  failedAttempts: number;
  securityScore: number;
  twoFactorEnabled: boolean;
  memberSince: string;
}

export interface PasswordRule {
  id: string;
  label: string;
  valid: boolean;
}

export interface SystemHealthData {
  system: string;
  version: string;
  status: string;
  timestamp: string;
  uptimeSeconds: number;
  environment: string;
  database: {
    status: string;
    connected: boolean;
    configured: boolean;
    driver: string;
  };
  modules: {
    authentication: string;
    bruteForceDetection: string;
    securityAuditLogging: string;
  };
}
