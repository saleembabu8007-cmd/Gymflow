import React from 'react';
import { cn } from '../../utils/classNames';
import { ArrowUpRight } from 'lucide-react';

export interface IconTileProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label: string;
  hasNavigationArrow?: boolean;
}

export const IconTile = React.forwardRef<HTMLButtonElement, IconTileProps>(
  ({ icon, label, hasNavigationArrow = false, className, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        aria-label={label}
        className={cn(
          'relative flex flex-col items-center justify-center p-2.5 sm:p-3 w-full h-[76px] sm:h-[88px]',
          'bg-white border border-neutral-200/80 rounded-[var(--radius-lg)] shadow-2xs transition-all select-none text-center',
          !disabled && 'hover:bg-neutral-50/80 active:scale-[0.98] cursor-pointer',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        {...props}
      >
        {/* Top-Right Navigation Arrow */}
        {hasNavigationArrow && (
          <div className="absolute top-2 right-2 text-neutral-300">
            <ArrowUpRight className="w-3 h-3" />
          </div>
        )}

        {/* Circular Badge for Icon */}
        <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-neutral-100 rounded-full text-neutral-700 mb-1.5 shrink-0">
          {icon}
        </div>

        {/* Label */}
        <div className="w-full text-center text-xs font-bold text-neutral-800 leading-tight truncate">
          {label}
        </div>
      </button>
    );
  }
);

IconTile.displayName = 'IconTile';
