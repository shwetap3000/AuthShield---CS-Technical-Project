import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar.tsx';
import { PhaseBanner } from '../components/PhaseBanner.tsx';
import { Shield, Github, Terminal, CheckCircle2 } from 'lucide-react';

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#030712] text-[#E5E7EB] font-sans">
      <Navbar />
      <PhaseBanner />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-gray-900 bg-gray-950/80 py-8 px-4 text-xs text-gray-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-500" />
            <span className="font-semibold text-gray-400">
              AuthShield – Secure Authentication & Brute-Force Detection System
            </span>
          </div>
          <div className="flex items-center gap-4 text-gray-400">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Phase 1 Foundation Verified
            </span>
            <span>•</span>
            <Link to="/api/health" target="_blank" className="hover:text-blue-400 flex items-center gap-1">
              <Terminal className="w-3.5 h-3.5 text-gray-400" /> /api/health
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
