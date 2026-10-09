import React from 'react';
import { Shield, AlertCircle, RefreshCw, FolderSearch } from 'lucide-react';

export const LoadingState: React.FC<{ message?: string }> = ({
  message = 'Authenticating security state...',
}) => (
  <div className="flex flex-col items-center justify-center p-12 space-y-4">
    <div className="relative">
      <div className="w-12 h-12 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
      <div className="absolute inset-0 flex items-center justify-center">
        <Shield className="w-5 h-5 text-blue-400" />
      </div>
    </div>
    <p className="text-sm text-gray-400 font-mono tracking-wide">{message}</p>
  </div>
);

export const ErrorState: React.FC<{
  title?: string;
  message: string;
  onRetry?: () => void;
}> = ({ title = 'Security Anomaly / Request Error', message, onRetry }) => (
  <div className="rounded-xl border border-red-900/60 bg-red-950/20 p-6 text-center space-y-3">
    <div className="inline-flex p-3 rounded-full bg-red-900/40 text-red-400 border border-red-700/50">
      <AlertCircle className="w-6 h-6" />
    </div>
    <h3 className="text-base font-semibold text-red-200">{title}</h3>
    <p className="text-sm text-red-300/80 max-w-md mx-auto">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-900/40 hover:bg-red-900/60 text-red-200 text-xs font-semibold border border-red-700/60 transition-colors"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        Retry Operation
      </button>
    )}
  </div>
);

export const EmptyState: React.FC<{
  title?: string;
  description: string;
}> = ({ title = 'No Security Records Found', description }) => (
  <div className="rounded-xl border border-gray-800 bg-gray-900/30 p-10 text-center space-y-3">
    <div className="inline-flex p-3 rounded-full bg-gray-800/80 text-gray-400 border border-gray-700/60">
      <FolderSearch className="w-6 h-6" />
    </div>
    <h3 className="text-sm font-semibold text-gray-300">{title}</h3>
    <p className="text-xs text-gray-500 max-w-sm mx-auto">{description}</p>
  </div>
);
