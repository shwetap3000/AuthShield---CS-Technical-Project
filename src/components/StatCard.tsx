import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtitle?: string;
  variant?: 'blue' | 'emerald' | 'amber' | 'red';
  badge?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  subtitle,
  variant = 'blue',
  badge,
}) => {
  const colorMap = {
    blue: {
      border: 'border-blue-900/40 hover:border-blue-700/60',
      iconBg: 'bg-blue-500/10 text-blue-400',
      accentGlow: 'hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]',
    },
    emerald: {
      border: 'border-emerald-900/40 hover:border-emerald-700/60',
      iconBg: 'bg-emerald-500/10 text-emerald-400',
      accentGlow: 'hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]',
    },
    amber: {
      border: 'border-amber-900/40 hover:border-amber-700/60',
      iconBg: 'bg-amber-500/10 text-amber-400',
      accentGlow: 'hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]',
    },
    red: {
      border: 'border-red-900/40 hover:border-red-700/60',
      iconBg: 'bg-red-500/10 text-red-400',
      accentGlow: 'hover:shadow-[0_0_20px_rgba(239,68,68,0.15)]',
    },
  };

  const scheme = colorMap[variant];

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-gray-900/70 backdrop-blur-sm border p-5 transition-all duration-200 ${scheme.border} ${scheme.accentGlow}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          {title}
        </span>
        <div className={`p-2.5 rounded-lg ${scheme.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold font-mono text-white tracking-tight">
          {value}
        </span>
        {badge && (
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-gray-800 text-gray-300 border border-gray-700">
            {badge}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-2 text-xs text-gray-400 flex items-center gap-1.5">
          {subtitle}
        </p>
      )}
    </div>
  );
};
