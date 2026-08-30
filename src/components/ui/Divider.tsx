import React from 'react';
import { cn } from '../../utils/classNames';

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  label?: string;
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  label,
  className,
}) => {
  if (orientation === 'vertical') {
    return <div className={cn('w-px bg-neutral-200 self-stretch my-1', className)} />;
  }

  if (label) {
    return (
      <div className={cn('flex items-center my-4 select-none font-sans', className)}>
        <div className="flex-1 border-t border-neutral-200" />
        <span className="px-3 text-[11px] font-mono font-bold text-neutral-500 uppercase tracking-wider">
          {label}
        </span>
        <div className="flex-1 border-t border-neutral-200" />
      </div>
    );
  }

  return <div className={cn('w-full border-t border-neutral-200 my-4', className)} />;
};
