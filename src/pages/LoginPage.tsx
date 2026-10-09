import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Mail,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ArrowRight,
  Info,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Unlock,
  Terminal,
} from 'lucide-react';
import { PasswordInput } from '../components/PasswordInput.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { apiService } from '../services/api.ts';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);

  // Security Notice state
  const [securityNotice, setSecurityNotice] = useState<{
    type: 'info' | 'warning' | 'lockout' | 'success';
    message: string;
    lockUntil?: string | null;
    attempts?: number;
    remainingAttempts?: number;
  } | null>(null);

  // Remaining lockout seconds countdown state
  const [lockoutSecondsLeft, setLockoutSecondsLeft] = useState<number | null>(null);

  // Read redirected notice if accessed via protected route
  useEffect(() => {
    if (location.state?.notice) {
      setSecurityNotice({
        type: 'warning',
        message: location.state.notice,
      });
    } else {
      setSecurityNotice({
        type: 'info',
        message:
          'Phase 3 Active: Brute-force detection engaged. 5 failed login attempts will trigger a temporary 15-minute account lockout.',
      });
    }
  }, [location.state]);

  // Countdown timer effect for lockout
  useEffect(() => {
    if (!securityNotice?.lockUntil) {
      setLockoutSecondsLeft(null);
      return;
    }

    const expiryTime = new Date(securityNotice.lockUntil).getTime();
    const updateCountdown = () => {
      const remainingMs = expiryTime - Date.now();
      if (remainingMs <= 0) {
        setLockoutSecondsLeft(0);
        setSecurityNotice({
          type: 'info',
          message: 'The temporary account lockout duration has elapsed. You may now attempt to log in.',
        });
      } else {
        setLockoutSecondsLeft(Math.ceil(remainingMs / 1000));
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [securityNotice?.lockUntil]);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      const destination = (location.state as any)?.from || '/dashboard';
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);

  const validate = () => {
    const errs: { email?: string; password?: string } = {};
    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      errs.email = 'Please provide a valid email format';
    }

    if (!password) {
      errs.password = 'Password is required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSecurityNotice(null);

    const result = await login({ email, password });
    setIsSubmitting(false);

    if (result.success) {
      setSecurityNotice({
        type: 'success',
        message: 'Credentials verified! Redirecting to Security Operations Console...',
      });
      const destination = (location.state as any)?.from || '/dashboard';
      setTimeout(() => {
        navigate(destination, { replace: true });
      }, 500);
    } else if (result.isLocked) {
      setSecurityNotice({
        type: 'lockout',
        message:
          result.message ||
          'Account is temporarily locked due to repeated failed login attempts. Further logins are prohibited until the timer expires.',
        lockUntil: result.lockUntil,
        attempts: result.attempts || 5,
        remainingAttempts: 0,
      });
    } else {
      setSecurityNotice({
        type: 'warning',
        message:
          result.attempts && result.remainingAttempts !== undefined
            ? `Authentication Failed: Attempt ${result.attempts} of 5. ${result.remainingAttempts} attempts remaining before temporary account lockout.`
            : result.message || 'Invalid email or password.',
        attempts: result.attempts,
        remainingAttempts: result.remainingAttempts,
      });
    }
  };

  const handleManualUnlock = async () => {
    if (!email.trim()) return;
    setIsUnlocking(true);
    const res = await apiService.unlockAccount(email.trim(), 'Demo UI manual override unlock');
    setIsUnlocking(false);

    if (res.success) {
      setSecurityNotice({
        type: 'success',
        message: `Account ${email.trim()} has been unlocked. Lockout cleared and failed counter reset.`,
      });
      setLockoutSecondsLeft(null);
    } else {
      setSecurityNotice({
        type: 'warning',
        message: res.message || 'Unable to unlock account.',
      });
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  return (
    <div className="max-w-md mx-auto py-8">
      <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-8 shadow-2xl backdrop-blur-sm space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white font-sans">Account Login</h1>
          <p className="text-xs text-gray-400">
            Authenticate to access the AuthShield Security Operations Console.
          </p>
        </div>

        {/* Quick Demo Credentials Assistant */}
        <div className="p-3 rounded-xl bg-gray-950/80 border border-gray-800 space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between text-gray-400">
            <span className="flex items-center gap-1.5 font-semibold text-gray-300">
              <Terminal className="w-3.5 h-3.5 text-blue-400" />
              <span>Cybersecurity Test Accounts</span>
            </span>
            <span className="text-[10px] text-blue-400">1-Click Fill</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setEmail('analyst@cyber.edu');
                setPassword('Password123!');
                setErrors({});
              }}
              className="p-2 rounded bg-gray-900 hover:bg-gray-850 border border-gray-800 text-left transition-colors"
            >
              <div className="font-semibold text-emerald-400 text-[11px]">Analyst (Active)</div>
              <div className="text-[10px] text-gray-400 truncate">analyst@cyber.edu</div>
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('target@cyber.edu');
                setPassword('Password123!');
                setErrors({});
              }}
              className="p-2 rounded bg-gray-900 hover:bg-gray-850 border border-red-900/50 text-left transition-colors"
            >
              <div className="font-semibold text-red-400 text-[11px]">Target (Locked Demo)</div>
              <div className="text-[10px] text-gray-400 truncate">target@cyber.edu</div>
            </button>
          </div>
        </div>

        {/* Security / Error Message Banner Area */}
        {securityNotice && (
          <div
            className={`p-4 rounded-xl border text-xs leading-relaxed flex flex-col gap-2 font-mono ${
              securityNotice.type === 'lockout'
                ? 'bg-red-950/60 border-red-700/80 text-red-200'
                : securityNotice.type === 'warning'
                ? 'bg-amber-950/50 border-amber-700/80 text-amber-200'
                : securityNotice.type === 'success'
                ? 'bg-emerald-950/50 border-emerald-700/80 text-emerald-200'
                : 'bg-blue-950/40 border-blue-800/80 text-blue-200'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {securityNotice.type === 'lockout' ? (
                <ShieldAlert className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
              ) : securityNotice.type === 'warning' ? (
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              ) : securityNotice.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              ) : (
                <Info className="w-4 h-4 shrink-0 text-blue-400 mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="font-semibold">
                  {securityNotice.type === 'lockout'
                    ? 'SECURITY LOCKOUT ACTIVE'
                    : securityNotice.type === 'warning'
                    ? 'AUTHENTICATION NOTICE'
                    : securityNotice.type === 'success'
                    ? 'VERIFICATION CONFIRMED'
                    : 'SECURITY POLICY'}
                </p>
                <p className="leading-normal">{securityNotice.message}</p>
              </div>
            </div>

            {/* Lockout Countdown and Manual Override */}
            {securityNotice.type === 'lockout' && (
              <div className="mt-2 pt-2 border-t border-red-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                {lockoutSecondsLeft !== null && lockoutSecondsLeft > 0 ? (
                  <div className="flex items-center gap-1.5 text-red-300 font-bold">
                    <Clock className="w-3.5 h-3.5 animate-pulse" />
                    <span>Lockout Time Remaining: {formatSeconds(lockoutSecondsLeft)}</span>
                  </div>
                ) : (
                  <span className="text-gray-300">Lockout duration elapsed.</span>
                )}

                <button
                  type="button"
                  onClick={handleManualUnlock}
                  disabled={isUnlocking}
                  className="px-2.5 py-1 rounded bg-red-900/60 hover:bg-red-800 border border-red-700 text-white font-semibold text-[11px] flex items-center justify-center gap-1 transition-colors disabled:opacity-50"
                  title="Unlock this account for demonstration or testing purposes"
                >
                  <Unlock className="w-3 h-3" />
                  <span>{isUnlocking ? 'Unlocking...' : 'Quick Unlock (Demo Override)'}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="analyst@cyber.edu"
                disabled={isSubmitting}
                className={`w-full pl-10 pr-3.5 py-2.5 bg-gray-950/80 border rounded-lg text-sm text-gray-100 placeholder-gray-500 focus:outline-none transition-colors disabled:opacity-60 font-mono ${
                  errors.email
                    ? 'border-red-500/80 focus:border-red-500'
                    : 'border-gray-800 focus:border-blue-500'
                }`}
              />
            </div>
            {errors.email && <p className="text-xs text-red-400 font-medium">{errors.email}</p>}
          </div>

          <PasswordInput
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            error={errors.password}
            disabled={isSubmitting}
          />

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="w-3.5 h-3.5 rounded bg-gray-950 border-gray-700 text-blue-600 focus:ring-0"
              />
              <span>Remember workstation</span>
            </label>
            <button
              type="button"
              onClick={() =>
                setSecurityNotice({
                  type: 'info',
                  message:
                    'For password recovery or account lockout assistance, contact your Security Operations Center or use the Demo Override button.',
                })
              }
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Verifying Credentials...</span>
              </span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link to Register */}
        <div className="pt-4 border-t border-gray-800 text-center text-xs text-gray-400">
          <span>Need a research account? </span>
          <Link to="/register" className="text-blue-400 hover:text-blue-300 font-semibold">
            Register here
          </Link>
        </div>

        {/* Phase Note */}
        <div className="p-3 rounded-lg bg-gray-950/60 border border-gray-800 text-[11px] text-gray-400 font-mono flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Phase 3 Active:</strong> Rolling 15-min failure detection window & automatic account lockout enforced.
          </span>
        </div>
      </div>
    </div>
  );
};

