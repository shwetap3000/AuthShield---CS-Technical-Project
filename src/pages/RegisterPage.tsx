import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Check, X, ArrowRight, UserPlus, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { PasswordInput } from '../components/PasswordInput.tsx';
import { analyzePassword } from '../utils/passwordStrength.ts';
import { useAuth } from '../context/AuthContext.tsx';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionFeedback, setSubmissionFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const passwordAnalysis = analyzePassword(password);

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!name.trim()) {
      errs.name = 'Full name is required';
    } else if (name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters';
    }

    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      errs.email = 'Please provide a valid email address';
    }

    if (!password) {
      errs.password = 'Password is required';
    } else if (!passwordAnalysis.isValid) {
      errs.password = 'Password does not meet cybersecurity strength requirements';
    }

    if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmissionFeedback(null);

    const result = await register({ name, email, password, confirmPassword });
    setIsSubmitting(false);

    if (result.success) {
      setSubmissionFeedback({
        type: 'success',
        message: 'Account registered and session secured! Redirecting to Security Console...',
      });
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 500);
    } else {
      setSubmissionFeedback({
        type: 'error',
        message: result.message || 'Unable to complete registration. Please try again.',
      });
    }
  };

  return (
    <div className="max-w-lg mx-auto py-6">
      <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-8 shadow-2xl backdrop-blur-sm space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white font-sans">Create Analyst Account</h1>
          <p className="text-xs text-gray-400">
            Register your identity in the AuthShield directory with strict password complexity rules.
          </p>
        </div>

        {submissionFeedback && (
          <div
            className={`p-3.5 rounded-xl border text-xs font-mono flex items-start gap-2.5 ${
              submissionFeedback.type === 'success'
                ? 'border-emerald-800/80 bg-emerald-950/40 text-emerald-200'
                : 'border-red-800/80 bg-red-950/40 text-red-200'
            }`}
          >
            {submissionFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
            )}
            <p>{submissionFeedback.message}</p>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Chen"
                disabled={isSubmitting}
                className={`w-full pl-10 pr-3.5 py-2.5 bg-gray-950/80 border rounded-lg text-sm text-gray-100 placeholder-gray-500 focus:outline-none transition-colors disabled:opacity-60 ${
                  errors.name
                    ? 'border-red-500/80 focus:border-red-500'
                    : 'border-gray-800 focus:border-blue-500'
                }`}
              />
            </div>
            {errors.name && <p className="text-xs text-red-400 font-medium">{errors.name}</p>}
          </div>

          {/* Email */}
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
                placeholder="alex.chen@cyber.edu"
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

          {/* Password */}
          <div className="space-y-2">
            <PasswordInput
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              error={errors.password}
              disabled={isSubmitting}
            />

            {/* Password Strength Indicator */}
            {password.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Password Strength:</span>
                  <span
                    className={`font-mono font-semibold ${
                      passwordAnalysis.score <= 1
                        ? 'text-red-400'
                        : passwordAnalysis.score <= 2
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {passwordAnalysis.label}
                  </span>
                </div>
                {/* 4-bar indicator */}
                <div className="grid grid-cols-4 gap-1.5 h-1.5">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`h-full rounded-full transition-all duration-300 ${
                        passwordAnalysis.score >= step
                          ? passwordAnalysis.color
                          : 'bg-gray-800'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Requirements Checklist */}
            <div className="p-3 rounded-lg bg-gray-950/70 border border-gray-800 space-y-1.5 text-xs font-mono">
              <span className="text-[11px] text-gray-500 font-semibold block uppercase mb-1">
                Security Requirements:
              </span>
              {passwordAnalysis.rules.map((rule) => (
                <div
                  key={rule.id}
                  className={`flex items-center gap-2 text-[11px] transition-colors ${
                    rule.valid ? 'text-emerald-400' : 'text-gray-500'
                  }`}
                >
                  {rule.valid ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-gray-600 shrink-0" />
                  )}
                  <span>{rule.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Confirm Password */}
          <PasswordInput
            label="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat password"
            error={errors.confirmPassword}
            disabled={isSubmitting}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Hashing & Persisting to MongoDB...</span>
              </span>
            ) : (
              <>
                <span>Register Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link to Login */}
        <div className="pt-4 border-t border-gray-800 text-center text-xs text-gray-400">
          <span>Already have an account? </span>
          <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold">
            Sign in here
          </Link>
        </div>

        {/* Phase Note */}
        <div className="p-3 rounded-lg bg-gray-950/60 border border-gray-800 text-[11px] text-gray-400 font-mono flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Phase 2 Security:</strong> Passwords are cryptographically hashed using bcrypt (10 rounds). Plaintext passwords are never stored.
          </span>
        </div>
      </div>
    </div>
  );
};

