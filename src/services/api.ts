import { SystemHealthData, SecurityStatistics, SecurityEvent, AuthUser } from '../types/index.ts';
import { sampleSecurityStats, sampleSecurityEvents } from '../data/sampleData.ts';

const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = localStorage.getItem('authshield_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const apiService = {
  /**
   * Save auth token
   */
  setToken(token: string | null) {
    if (token) {
      localStorage.setItem('authshield_token', token);
    } else {
      localStorage.removeItem('authshield_token');
    }
  },

  /**
   * Get stored auth token
   */
  getToken(): string | null {
    return localStorage.getItem('authshield_token');
  },

  /**
   * Fetch backend system health check
   */
  async getHealth(): Promise<SystemHealthData | null> {
    try {
      const res = await fetch(`${API_BASE}/health`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      return json.data;
    } catch (error) {
      console.warn('Backend health check error (using fallback):', error);
      return null;
    }
  },

  /**
   * Register a new user with bcrypt password hashing in MongoDB
   */
  async register(payload: { name: string; email: string; password: string; confirmPassword?: string }): Promise<{
    success: boolean;
    user?: AuthUser;
    token?: string;
    message?: string;
  }> {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        return { success: false, message: json.message || 'Registration failed.' };
      }
      if (json.data?.token) {
        this.setToken(json.data.token);
      }
      return { success: true, user: json.data?.user, token: json.data?.token, message: json.message };
    } catch (err: any) {
      return { success: false, message: 'Unable to connect to the server. Please try again.' };
    }
  },

  /**
   * Authenticate user with password comparison
   */
  async login(payload: { email: string; password: string }): Promise<{
    success: boolean;
    user?: AuthUser;
    token?: string;
    message?: string;
  }> {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        return { success: false, message: json.message || 'Invalid email or password.' };
      }
      if (json.data?.token) {
        this.setToken(json.data.token);
      }
      return { success: true, user: json.data?.user, token: json.data?.token, message: json.message };
    } catch (err: any) {
      return { success: false, message: 'Unable to connect to the server. Please try again.' };
    }
  },

  /**
   * Get currently authenticated user profile
   */
  async getMe(): Promise<{ success: boolean; user?: AuthUser; message?: string }> {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        return { success: false, message: json.message || 'Not authenticated' };
      }
      return { success: true, user: json.data?.user };
    } catch (err: any) {
      return { success: false, message: 'Network error checking authentication.' };
    }
  },

  /**
   * Logout user and invalidate token
   */
  async logout(): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      this.setToken(null);
      const json = await res.json();
      return { success: true, message: json.message };
    } catch (err: any) {
      this.setToken(null);
      return { success: true, message: 'Logged out locally.' };
    }
  },

  /**
   * Fetch live security statistics from MongoDB
   */
  async getSecurityStats(): Promise<SecurityStatistics> {
    try {
      const res = await fetch(`${API_BASE}/security/stats`, {
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      return json.data || sampleSecurityStats;
    } catch {
      return sampleSecurityStats;
    }
  },

  /**
   * Fetch live security audit logs from MongoDB
   */
  async getSecurityLogs(eventType?: string): Promise<SecurityEvent[]> {
    try {
      const url = eventType
        ? `${API_BASE}/security/logs?eventType=${encodeURIComponent(eventType)}`
        : `${API_BASE}/security/logs`;
      const res = await fetch(url, {
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      return json.data?.logs || [];
    } catch {
      return sampleSecurityEvents;
    }
  },
};

