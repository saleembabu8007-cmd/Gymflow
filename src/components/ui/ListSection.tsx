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
      <div className="sticky top-[72px] z-10 py-3 bg-zinc-50/95 backdrop-blur-md flex flex-col justify-center">
        <div className="flex items-center gap-2">
          <h2 className="text-[12px] font-bold uppercase tracking-wider text-slate-600">
            {title}
          </h2>
          {count !== undefined && (
            <span
              className={cn(
                "px-2 py-0.5 text-[10px] font-bold rounded-full border",
                badgeVariant === 'danger' && "bg-rose-50 text-rose-700 border-rose-200/60",
                badgeVariant === 'warning' && "bg-amber-50 text-amber-700 border-amber-200/60",
                badgeVariant === 'success' && "bg-emerald-50 text-emerald-700 border-emerald-200/60",
                badgeVariant === 'neutral' && "bg-slate-100 text-slate-700 border-slate-200"
              )}
            >
              {count}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-[11px] font-medium text-slate-500 mt-0.5">{subtitle}</p>
        )}
      </div>

      {/* List Container - Card + Gap separation strategy */}
      <div className={cn("flex flex-col gap-3 py-4", listClassName)}>
        {children}
      </div>
    </section>
  );
};
