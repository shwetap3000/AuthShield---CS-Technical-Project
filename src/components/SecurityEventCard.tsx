import React from 'react';
import { SecurityEvent } from '../types/index.ts';
import { StatusBadge } from './StatusBadge.tsx';
import { ShieldAlert, ShieldCheck, AlertTriangle, Lock, Clock, Terminal } from 'lucide-react';

interface SecurityEventCardProps {
  event: SecurityEvent;
}

export const SecurityEventCard: React.FC<SecurityEventCardProps> = ({ event }) => {
  const getEventIcon = () => {
    switch (event.eventType) {
      case 'BRUTE_FORCE_TRIGGERED':
        return <ShieldAlert className="w-5 h-5 text-red-400" />;
      case 'ACCOUNT_LOCKED':
        return <Lock className="w-5 h-5 text-amber-400" />;
      case 'LOGIN_SUCCESS':
        return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
      case 'LOGIN_FAILURE':
        return <AlertTriangle className="w-5 h-5 text-rose-400" />;
      default:
        return <Terminal className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <div className="group rounded-xl bg-gray-900/60 border border-gray-800/80 p-4 hover:border-gray-700/80 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gray-800/80 border border-gray-700/50">
            {getEventIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-200 text-sm">
                {event.eventType.replace(/_/g, ' ')}
              </span>
              <span className="text-xs font-mono text-gray-500">[{event.id}]</span>
            </div>
            <p className="text-xs text-blue-400 font-mono">{event.user}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <StatusBadge status={event.status} size="sm" />
          <div className="flex items-center gap-1 text-xs text-gray-400 font-mono">
            <Clock className="w-3.5 h-3.5 text-gray-500" />
            <span>{event.timestamp}</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-300 leading-relaxed pl-1 sm:pl-11 mb-2">
        {event.description}
      </p>

      <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-gray-500 pl-1 sm:pl-11 pt-1 border-t border-gray-800/50">
        <span>IP: <strong className="text-gray-400">{event.ipAddress}</strong></span>
        <span>Client: <strong className="text-gray-400">{event.userAgent}</strong></span>
        {event.attemptCount > 1 && (
          <span>Attempts: <strong className="text-red-400">{event.attemptCount}</strong></span>
        )}
      </div>
    </div>
  );
};
