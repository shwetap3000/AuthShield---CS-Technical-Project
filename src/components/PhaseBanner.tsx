import React from 'react';
import { ShieldAlert, Info } from 'lucide-react';

export const PhaseBanner: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-blue-950/60 via-gray-900/80 to-blue-950/60 border-y border-blue-900/40 px-4 py-2.5 text-xs text-gray-300">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-emerald-400 font-mono">[PHASE 3 ACTIVE]</span>
          <span className="text-gray-300">
            Brute-Force Attack Detection, Rolling 15-Min Window Tracking & Automatic 15-Min Account Lockout Operational in MongoDB.
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] text-gray-400">
          <Info className="w-3.5 h-3.5 text-blue-400" />
          <span>College Cybersecurity Project Demo</span>
        </div>
      </div>
    </div>
  );
};
