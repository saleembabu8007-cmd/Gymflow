import React from 'react';
import { cn } from '../../utils/classNames';
import { Check, Clock, Calendar, AlertTriangle } from 'lucide-react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'neutral' | 'success' | 'warning' | 'danger' | 'info';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  icon,
  className,
}) => {
  const variantClasses = {
    neutral: 'bg-slate-100 text-slate-700',
    success: 'bg-emerald-50 text-emerald-700',
    warning: 'bg-amber-50 text-amber-700',
    danger: 'bg-rose-50 text-rose-700',
    info: 'bg-sky-50 text-sky-700',
  };

  const getDefaultIcon = () => {
    switch (variant) {
      case 'success':
        return <Check className="w-3 h-3" />;
      case 'warning':
        return <AlertTriangle className="w-3 h-3" />;
      case 'danger':
        return <Clock className="w-3 h-3" />; // Clock for overdue
      case 'info':
        return <Calendar className="w-3 h-3" />; // Calendar for upcoming
      case 'neutral':
      default:
        return null;
    }
  };

  const activeIcon = icon !== undefined ? icon : getDefaultIcon();

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase whitespace-nowrap select-none transition-colors font-mono',
        variantClasses[variant],
        className
      )}
    >
      {activeIcon && <span className="shrink-0 flex items-center justify-center">{activeIcon}</span>}
      <span>{children}</span>
    </span>
  );
};
