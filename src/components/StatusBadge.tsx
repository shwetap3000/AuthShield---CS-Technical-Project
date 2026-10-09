import React from 'react';
import { EventStatus } from '../types/index.ts';

interface StatusBadgeProps {
  status: EventStatus | 'PROTECTED' | 'ACTIVE' | 'LOCKED' | 'PENDING' | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const normalized = status.toUpperCase();

  let styles = 'bg-gray-800 text-gray-300 border-gray-700';
  let dotColor = 'bg-gray-400';

  if (normalized === 'SUCCESS' || normalized === 'PROTECTED' || normalized === 'ACTIVE') {
    styles = 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80';
    dotColor = 'bg-emerald-400';
  } else if (normalized === 'BLOCKED' || normalized === 'LOCKED' || normalized === 'CRITICAL') {
    styles = 'bg-red-950/60 text-red-300 border-red-800/80';
    dotColor = 'bg-red-400';
  } else if (normalized === 'WARNING' || normalized === 'PENDING') {
    styles = 'bg-amber-950/60 text-amber-300 border-amber-800/80';
    dotColor = 'bg-amber-400';
  } else if (normalized === 'FAILED') {
    styles = 'bg-rose-950/60 text-rose-300 border-rose-800/80';
    dotColor = 'bg-rose-400';
  }

  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${padding} ${styles} font-mono`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} animate-pulse`} />
      {normalized}
    </span>
  );
};
