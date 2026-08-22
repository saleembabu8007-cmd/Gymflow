import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../utils/classNames';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: LucideIcon | React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-[24px] bg-slate-50/50',
        className
      )}
    >
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 mb-6 shadow-sm border border-teal-100/50">
          {typeof Icon === 'function' ? <Icon className="w-8 h-8 stroke-[1.5]" /> : Icon}
        </div>
      )}
      <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">{title}</h2>
      {description && (
        <p className="text-[15px] font-medium text-slate-500 mt-3 max-w-md leading-relaxed">{description}</p>
      )}
      {actionLabel && onAction && (
        <div className="mt-8">
          <Button onClick={onAction} size="lg" className="px-8 shadow-sm">
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
