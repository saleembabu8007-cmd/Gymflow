import React from 'react';
import { cn } from '../../utils/classNames';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className,
  icon,
}) => {
  const variantClasses = {
    neutral: 'text-zinc-500',
    primary: 'text-zinc-900',
    success: 'text-emerald-600',
    warning: 'text-amber-600',
    danger: 'text-rose-600',
    info: 'text-sky-600',
  };

  const dotClasses = {
    neutral: 'bg-zinc-400',
    primary: 'bg-zinc-900',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    info: 'bg-sky-500',
  };

  const sizeClasses = {
    sm: 'text-[10px] gap-1.5 font-bold uppercase tracking-wider',
    md: 'text-[11px] gap-1.5 font-bold uppercase tracking-wider',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap select-none transition-colors font-mono',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {icon ? <span className="shrink-0">{icon}</span> : <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotClasses[variant])} />}
      <span>{children}</span>
    </span>
  );
};
