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
    <section className={cn("relative", className)}>
      {/* Sticky Header */}
      <div className="sticky top-[72px] z-10 -mx-4 px-4 py-3 sm:-mx-6 sm:px-6 bg-white/95 backdrop-blur-md border-b border-slate-100 flex items-center justify-between shadow-[0_4px_12px_rgba(255,255,255,1)]">
        <div>
          <h2 className="text-[12px] font-bold uppercase tracking-wider text-slate-600">
            {title}
          </h2>
          {subtitle && (
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">{subtitle}</p>
          )}
        </div>
        {count !== undefined && (
          <span
            className={cn(
              "px-2 py-0.5 text-[10px] font-bold rounded-full",
              badgeVariant === 'danger' && "bg-rose-100 text-rose-700",
              badgeVariant === 'warning' && "bg-amber-100 text-amber-700",
              badgeVariant === 'success' && "bg-emerald-100 text-emerald-700",
              badgeVariant === 'neutral' && "bg-slate-100 text-slate-600"
            )}
          >
            {count}
          </span>
        )}
      </div>

      {/* List Container - Card + Gap separation strategy */}
      <div className={cn("flex flex-col gap-3 py-4", listClassName)}>
        {children}
      </div>
    </section>
  );
};
