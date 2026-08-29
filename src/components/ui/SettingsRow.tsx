import React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '../../utils/classNames';

export interface SettingsRowProps {
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const SettingsRow: React.FC<SettingsRowProps> = ({
  icon,
  label,
  value,
  onClick,
  className,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full flex items-center justify-between p-3.5 sm:p-4 bg-white hover:bg-neutral-50/90 transition-colors text-left group cursor-pointer select-none',
        className
      )}
    >
      <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
        {icon && (
          <div className="text-neutral-400 shrink-0 mt-0.5 sm:mt-0">
            {icon}
          </div>
        )}
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-0.5 font-mono">
            {label}
          </span>
          <span className="text-xs sm:text-sm font-medium text-neutral-900 leading-snug truncate">
            {value}
          </span>
        </div>
      </div>
      <div className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 shrink-0 group-hover:bg-neutral-200 group-hover:text-neutral-700 transition-colors ml-3">
        <ChevronRight className="w-3.5 h-3.5" />
      </div>
    </button>
  );
};
