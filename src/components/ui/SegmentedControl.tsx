import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../utils/classNames';

export interface SegmentedControlOption {
  value: string | number;
  label: string;
  count?: number;
  badgeVariant?: 'neutral' | 'danger' | 'warning' | 'success';
}

export interface SegmentedControlProps {
  id?: string;
  label?: string;
  options: SegmentedControlOption[];
  value: string | number;
  onChange: (value: any) => void;
  className?: string;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  id,
  label,
  options,
  value,
  onChange,
  className,
}) => {
  // Use a stable ID if none provided so layoutId works correctly
  const [controlId] = React.useState(() => id || `segmented-${Math.random().toString(36).substring(7)}`);

  return (
    <div className={cn("flex flex-col gap-1.5 w-full", className)}>
      {label && (
        <label htmlFor={controlId} className="text-[12px] font-medium text-neutral-500 select-none">
          {label}
        </label>
      )}
      
      <div 
        id={controlId}
        className="flex p-1 bg-slate-100 rounded-[12px] relative w-full"
        role="radiogroup"
        aria-label={label}
      >
        {options.map((option) => {
          const isSelected = value === option.value;
          
          const badgeColors = {
            neutral: 'bg-slate-200 text-slate-700',
            danger: 'bg-rose-100 text-rose-700',
            warning: 'bg-amber-100 text-amber-800',
            success: 'bg-emerald-100 text-emerald-800',
          };
          const badgeVariant = option.badgeVariant || 'neutral';
          
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(option.value)}
              className={cn(
                "relative flex-1 flex items-center justify-center gap-1.5 py-2 text-[14px] font-semibold rounded-[8px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                isSelected ? "text-slate-900" : "text-slate-600 hover:text-slate-700"
              )}
            >
              {isSelected && (
                <motion.div
                  layoutId={`${controlId}-indicator`}
                  className="absolute inset-0 bg-white rounded-[8px] shadow-sm pointer-events-none"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{option.label}</span>
              {option.count !== undefined && (
                <span 
                  className={cn(
                    "relative z-10 flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full text-[11px] font-bold",
                    isSelected 
                      ? "bg-slate-100 text-slate-700" 
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
    </div>
  );
};
