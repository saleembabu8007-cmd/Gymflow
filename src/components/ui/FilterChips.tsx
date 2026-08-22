import React from 'react';
import { cn } from '../../utils/classNames';

export interface FilterChipOption<T extends string> {
  id: T;
  label: string;
  count?: number;
  badgeVariant?: 'neutral' | 'danger' | 'warning' | 'success';
  icon?: React.ReactNode;
}

export interface FilterChipsProps<T extends string> {
  options: FilterChipOption<T>[];
  activeId: T;
  onChange: (id: T) => void;
  className?: string;
}

export function FilterChips<T extends string>({
  options,
  activeId,
  onChange,
  className,
}: FilterChipsProps<T>) {
  return (
    <div className={cn("flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none", className)}>
      {options.map((option) => {
        const isActive = activeId === option.id;
        
        const badgeColors = {
          neutral: 'bg-slate-200 text-slate-700',
          danger: 'bg-rose-100 text-rose-700',
          warning: 'bg-amber-100 text-amber-800',
          success: 'bg-emerald-100 text-emerald-800',
        };
        const badgeVariant = option.badgeVariant || 'neutral';
        
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-full text-[14px] font-semibold whitespace-nowrap transition-all cursor-pointer border',
              isActive
                ? 'bg-teal-600 border-teal-600 text-white shadow-sm'
                : 'bg-slate-100 border-transparent text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
            )}
          >
            {option.icon && <span className="mr-1">{option.icon}</span>}
            {option.label}
            
            {option.count !== undefined && (
              <span 
                className={cn(
                  "flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full text-[11px] font-bold",
                  isActive 
                    ? "bg-white/20 text-white" 
                    : badgeColors[badgeVariant]
                )}
              >
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
