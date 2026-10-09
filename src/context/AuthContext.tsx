import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser } from '../types/index.ts';
import { apiService } from '../services/api.ts';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<{
    success: boolean;
    message?: string;
    isLocked?: boolean;
    lockUntil?: string | null;
    remainingAttempts?: number;
    attempts?: number;
  }>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    confirmPassword?: string;
  }) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const res = await apiService.getMe();
      if (res.success && res.user) {
        setUser(res.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const res = await apiService.login(credentials);
      if (res.success && res.user) {
        setUser(res.user);
        setIsLoading(false);
        return { success: true };
      }
      setIsLoading(false);
      return {
        success: false,
        message: res.message || 'Invalid email or password.',
        isLocked: res.accountLocked,
        lockUntil: res.lockUntil,
        remainingAttempts: res.remainingAttempts,
        attempts: res.attempts,
      };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, message: 'Unable to connect to the authentication server.' };
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    confirmPassword?: string;
  }) => {
    setIsLoading(true);
    try {
      const res = await apiService.register(data);
      if (res.success && res.user) {
        setUser(res.user);
        setIsLoading(false);
        return { success: true };
      }
      setIsLoading(false);
      return { success: false, message: res.message || 'Registration failed.' };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, message: 'Unable to connect to the authentication server.' };
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await apiService.logout();
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
