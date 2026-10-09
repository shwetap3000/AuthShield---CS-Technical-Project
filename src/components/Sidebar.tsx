import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  ShieldAlert,
  User,
  ShieldCheck,
  Cpu,
  Layers,
  Database,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Login Activity', path: '/login-activity', icon: Activity },
    { name: 'Security Events', path: '/security-events', icon: ShieldAlert },
    { name: 'User Profile', path: '/profile', icon: User },
  ];

  return (
    <aside className="w-full lg:w-64 shrink-0 space-y-6">
      {/* Navigation Card */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-3 space-y-1">
        <div className="px-3 py-2 text-[11px] font-mono uppercase tracking-wider text-gray-500 font-semibold">
          Security Console
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 shadow-sm'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
              }`
            }
          >
            <item.icon className="w-4 h-4 text-blue-400" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </div>

      {/* Cyber Architecture Spec Card */}
      <div className="rounded-xl border border-gray-800/80 bg-gray-950/70 p-4 space-y-3 font-mono text-xs">
        <div className="flex items-center gap-2 text-gray-300 font-semibold">
          <Layers className="w-4 h-4 text-blue-400" />
          <span>System Topology</span>
        </div>
        <div className="space-y-2 text-gray-400 text-[11px]">
          <div className="flex items-center justify-between py-1 border-b border-gray-900">
            <span className="flex items-center gap-1.5 text-gray-500">
              <Cpu className="w-3 h-3" /> Core Engine
            </span>
            <span className="text-gray-300 font-semibold">Express 4.21</span>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-gray-900">
            <span className="flex items-center gap-1.5 text-gray-500">
              <Database className="w-3 h-3" /> Database
            </span>
            <span className="text-emerald-400 font-semibold">Mongoose 8</span>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-gray-900">
            <span className="flex items-center gap-1.5 text-gray-500">
              <ShieldCheck className="w-3 h-3" /> Policy Mode
            </span>
            <span className="text-blue-400 font-semibold">Brute-Force v1</span>
          </div>
        </div>
        <div className="p-2.5 rounded-lg bg-blue-950/30 border border-blue-900/40 text-[10px] text-blue-300/80 leading-relaxed">
          Phase 1 Foundation active. Scaffolding ready for Argon2/bcrypt & lockout timers.
        </div>
      </div>
    </aside>
  );
};
