import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Activity,
  ArrowRight,
  Database,
  KeyRound,
  FileCode2,
  Terminal,
  CheckCircle2,
  AlertOctagon,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const features = [
    {
      title: 'Secure Authentication',
      description:
        'Robust user credential verification with modern bcrypt cryptographic hashing, salted iteration rounds, and sanitized payload ingestion.',
      icon: KeyRound,
      badge: 'Cryptographic Security',
      color: 'blue',
    },
    {
      title: 'Brute-Force Detection',
      description:
        'Continuous analysis of consecutive failed attempts, anomaly detection per IP/account, and automated defense thresholds.',
      icon: ShieldAlert,
      badge: 'Active Defense',
      color: 'red',
    },
    {
      title: 'Account Protection',
      description:
        'Automatic temporary account lockout windows with time-based cool-down periods to mitigate automated dictionary and credential stuffing attacks.',
      icon: Lock,
      badge: 'Lockout Safeguard',
      color: 'amber',
    },
    {
      title: 'Security Monitoring',
      description:
        'Audit-grade security telemetry logging authentication successes, anomalies, origin IPs, and lockout events without exposing sensitive secrets.',
      icon: Activity,
      badge: 'Audit Telemetry',
      color: 'emerald',
    },
  ];

  const archSteps = [
    {
      role: 'User & Client',
      desc: 'React Frontend with input sanitization, password strength validation, and secure headers.',
      icon: FileCode2,
    },
    {
      role: 'Express Backend',
      desc: 'Modular REST API, Helmet HTTP security headers, CORS origin enforcement, and audit middleware.',
      icon: Terminal,
    },
    {
      role: 'Security Engine',
      desc: 'Failed attempt counter, exponential backoff, and lockout enforcement algorithms.',
      icon: ShieldCheck,
    },
    {
      role: 'MongoDB / Mongoose',
      desc: 'Normalized schemas with bcrypt hash isolation and immutable security event logs.',
      icon: Database,
    },
  ];

  return (
    <div className="space-y-16 py-4">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl border border-gray-800/90 bg-gradient-to-b from-gray-900/80 via-gray-950/90 to-[#030712] p-8 md:p-14 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/70 border border-blue-800/60 text-blue-300 text-xs font-mono">
          <Shield className="w-3.5 h-3.5 text-blue-400" />
          <span>College Cybersecurity Project • Phase 3: Brute-Force Detection & Lockout</span>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white font-sans leading-tight">
            Secure Authentication & <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-400">
              Brute-Force Detection System
            </span>
          </h1>
          <p className="text-base sm:text-lg text-gray-400 leading-relaxed max-w-2xl mx-auto">
            AuthShield is a full-stack cybersecurity demonstration illustrating how modern web systems defend user accounts from unauthorized access, automated dictionary attacks, and credential stuffing.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/20"
          >
            <span>Explore Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-200 border border-gray-700/80 font-semibold text-sm transition-all"
          >
            <span>Login Portal</span>
          </Link>
          <Link
            to="/register"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-950 hover:bg-gray-900 text-blue-400 border border-blue-900/50 font-semibold text-sm transition-all"
          >
            <span>Register Account</span>
          </Link>
        </div>

        {/* Security Matrix Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-gray-800/70 text-left">
          <div className="p-3.5 rounded-lg bg-gray-950/60 border border-gray-800">
            <span className="text-[11px] font-mono text-gray-500 uppercase block">Defense Mode</span>
            <span className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5 mt-0.5">
              <CheckCircle2 className="w-4 h-4" /> Threshold Lockout
            </span>
          </div>
          <div className="p-3.5 rounded-lg bg-gray-950/60 border border-gray-800">
            <span className="text-[11px] font-mono text-gray-500 uppercase block">Max Attempts</span>
            <span className="text-sm font-semibold text-blue-400 font-mono mt-0.5">5 Failures</span>
          </div>
          <div className="p-3.5 rounded-lg bg-gray-950/60 border border-gray-800">
            <span className="text-[11px] font-mono text-gray-500 uppercase block">Lockout Window</span>
            <span className="text-sm font-semibold text-amber-400 font-mono mt-0.5">15 Minutes</span>
          </div>
          <div className="p-3.5 rounded-lg bg-gray-950/60 border border-gray-800">
            <span className="text-[11px] font-mono text-gray-500 uppercase block">Storage Protocol</span>
            <span className="text-sm font-semibold text-gray-300 font-mono mt-0.5">Bcrypt Hashes Only</span>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="space-y-6">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-mono uppercase tracking-wider text-blue-400 font-semibold">
            Security Pillars
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-sans">
            Engineered for Defensive Rigor
          </h2>
          <p className="text-xs sm:text-sm text-gray-400">
            Essential cybersecurity controls implemented to withstand automated credential attacks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="rounded-xl border border-gray-800/80 bg-gray-900/40 p-6 space-y-3 hover:border-gray-700/80 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-lg bg-gray-800 text-blue-400 border border-gray-700/50">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-gray-800 text-gray-300 border border-gray-700">
                    {f.badge}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white font-sans">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Architecture Section */}
      <section className="rounded-2xl border border-gray-800/80 bg-gray-950/60 p-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-wider text-blue-400 font-semibold">
              System Topology
            </span>
            <h2 className="text-2xl font-bold text-white font-sans">
              Separation of Responsibilities Architecture
            </h2>
          </div>
          <span className="text-xs font-mono text-gray-400 bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-800">
            User → React Frontend → Node/Express → MongoDB
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {archSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-xl bg-gray-900/60 border border-gray-800 relative space-y-2"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-blue-400 font-bold">0{idx + 1}.</span>
                  <div className="p-1.5 rounded-md bg-blue-950 text-blue-300 border border-blue-800/60">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <h4 className="text-sm font-semibold text-white font-sans">{step.role}</h4>
                <p className="text-xs text-gray-400 leading-relaxed">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
