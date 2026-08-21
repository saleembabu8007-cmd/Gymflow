import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { cn } from '../../utils/classNames';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  onBack?: () => void;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  badge,
  actions,
  onBack,
  className,
}) => {
  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-200/50 select-none', className)}>
      <div className="flex items-start gap-3 min-w-0">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 -ml-1.5 rounded-md text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 transition-colors shrink-0 cursor-pointer"
            title="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-950 tracking-tight leading-tight truncate">
              {title}
            </h1>
            {badge && <div className="shrink-0">{badge}</div>}
          </div>
          {subtitle && <p className="text-xs sm:text-sm text-zinc-500 mt-1 leading-normal">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2.5 shrink-0 flex-wrap">{actions}</div>}
    </div>
  );
};
