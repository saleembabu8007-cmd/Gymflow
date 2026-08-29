import React from 'react';
import { cn } from '../../utils/classNames';

export interface ListSectionProps {
  title: string;
  count?: number;
  badgeVariant?: 'neutral' | 'danger' | 'success' | 'warning';
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  listClassName?: string;
}

export const ListSection: React.FC<ListSectionProps> = ({
  title,
  count,
  badgeVariant = 'neutral',
  subtitle,
  children,
  className,
  listClassName,
}) => {
  return (
    <section className={cn('space-y-2 select-none font-sans', className)}>
      {/* Section Header */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <h2 className="text-xs sm:text-sm font-bold text-neutral-950 font-display">
            {title}
          </h2>
          {count !== undefined && (
            <span
              className={cn(
                'px-1.5 py-0.2 text-[10px] font-mono font-bold rounded-full border',
                badgeVariant === 'danger' && 'bg-[var(--color-danger-50)] text-[var(--color-danger-700)] border-[var(--color-danger-200)]',
                badgeVariant === 'warning' && 'bg-[var(--color-warning-50)] text-[var(--color-warning-800)] border-[var(--color-warning-200)]',
                badgeVariant === 'success' && 'bg-[var(--color-success-50)] text-[var(--color-success-800)] border-[var(--color-success-200)]',
                badgeVariant === 'neutral' && 'bg-neutral-100 text-neutral-700 border-neutral-200'
              )}
            >
              {count}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-[11px] font-medium text-neutral-500 font-mono">{subtitle}</p>
        )}
      </div>

      {/* List Container */}
      <div className={cn('bg-white border border-neutral-200/80 rounded-[var(--radius-lg)] shadow-2xs divide-y divide-neutral-100 overflow-hidden', listClassName)}>
        {children}
      </div>
    </section>
  );
};
