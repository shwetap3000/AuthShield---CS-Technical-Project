import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, AlertTriangle, CheckCircle2, Lock, ArrowRight, Info, ShieldCheck } from 'lucide-react';
import { PasswordInput } from '../components/PasswordInput.tsx';
import { useAuth } from '../context/AuthContext.tsx';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [securityNotice, setSecurityNotice] = useState<{
    type: 'info' | 'warning' | 'lockout' | 'success';
    message: string;
  } | null>(null);

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
          'Security Policy: Real bcrypt hash verification active. Each attempt is recorded to MongoDB security audit logs.',
      });
    }
  }, [location.state]);

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
    } else {
      setSecurityNotice({
        type: 'warning',
        message: result.message || 'Invalid email or password.',
      });
    }
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

        {/* Security / Error Message Banner Area */}
        {securityNotice && (
          <div
            className={`p-3.5 rounded-xl border text-xs leading-relaxed flex items-start gap-2.5 font-mono ${
              securityNotice.type === 'warning'
                ? 'bg-amber-950/40 border-amber-800/80 text-amber-200'
                : securityNotice.type === 'lockout'
                ? 'bg-red-950/40 border-red-800/80 text-red-200'
                : securityNotice.type === 'success'
                ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
                : 'bg-blue-950/40 border-blue-800/80 text-blue-200'
            }`}
          >
            {securityNotice.type === 'warning' || securityNotice.type === 'lockout' ? (
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            ) : securityNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            ) : (
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
            )}
            <div>
              <p>{securityNotice.message}</p>
            </div>
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
                className={`w-full pl-10 pr-3.5 py-2.5 bg-gray-950/80 border rounded-lg text-sm text-gray-100 placeholder-gray-500 focus:outline-none transition-colors disabled:opacity-60 ${
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
                  message: 'Password reset self-service workflows will be implemented in Phase 3.',
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
            <strong>Phase 2 Security:</strong> Passwords checked against salted bcrypt hashes. Login attempts audited in MongoDB.
          </span>
        </div>
      </div>
    </div>
  );
};

