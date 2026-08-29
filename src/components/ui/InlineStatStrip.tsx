import React from 'react';
import { cn } from '../../utils/classNames';
import { TwoTierNumber } from './TwoTierNumber';

export interface InlineStatStripProps {
  children: React.ReactNode;
  className?: string;
}

export const InlineStatStrip = ({ children, className }: InlineStatStripProps) => {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-2 text-[length:var(--text-caption-size)] px-1 sm:px-0", className)}>
      {children}
    </div>
  );
};

export interface InlineStatProps {
  label: string;
  value: React.ReactNode;
  indicatorClass?: string; // e.g. 'bg-[var(--color-success-500)]'
  isLast?: boolean;
}

export const InlineStat = ({ label, value, indicatorClass, isLast }: InlineStatProps) => {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5">
        {indicatorClass && (
          <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", indicatorClass)} />
        )}
        <TwoTierNumber value={value} caption={label} size="md" />
      </div>
      {!isLast && (
        <span className="text-neutral-300 font-bold">&middot;</span>
      )}
    </div>
  );
};

InlineStatStrip.Stat = InlineStat;
