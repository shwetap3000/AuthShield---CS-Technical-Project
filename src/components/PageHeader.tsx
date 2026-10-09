import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  badge?: string;
  action?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  icon: Icon,
  badge,
  action,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-800/80 mb-6">
      <div className="flex items-start gap-3.5">
        {Icon && (
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mt-0.5">
            <Icon className="w-6 h-6" />
          </div>
        )}
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
              {title}
            </h1>
            {badge && (
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-900/40 text-blue-300 border border-blue-700/60">
                {badge}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400 mt-1 max-w-2xl leading-relaxed">
            {description}
          </p>
        </div>
      </div>
      {action && <div className="flex items-center gap-3">{action}</div>}
    </div>
  );
};
