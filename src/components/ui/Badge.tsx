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
    neutral: 'bg-neutral-100 border-neutral-200 text-neutral-700',
    primary: 'bg-neutral-900 border-neutral-900 text-white',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    warning: 'bg-amber-50 border-amber-300 text-amber-900',
    danger: 'bg-rose-50 border-rose-200 text-rose-700',
    info: 'bg-indigo-50 border-indigo-200 text-indigo-700',
  };

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1 font-bold',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-semibold',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border whitespace-nowrap select-none transition-colors',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
