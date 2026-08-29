import React from 'react';
import { cn } from '../../utils/classNames';

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  count?: number;
  action?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  count,
  action,
  className,
}) => {
  return (
    <div className={cn('flex items-center justify-between gap-3 pb-3 border-b border-neutral-200/80 select-none', className)}>
      <div className="flex items-center gap-2 min-w-0">
        <h2 className="text-base font-bold text-neutral-900 tracking-tight truncate font-display">
          {title}
        </h2>
        {count !== undefined && (
          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-neutral-100 text-neutral-700 font-mono">
            {count}
          </span>
        )}
        {subtitle && (
          <span className="hidden sm:inline-block text-xs font-medium text-neutral-500 truncate">
            · {subtitle}
          </span>
        )}
      </div>
      {action && <div className="shrink-0 flex items-center gap-2">{action}</div>}
    </div>
  );
};
