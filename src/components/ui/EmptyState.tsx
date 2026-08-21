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
        'flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/50',
        className
      )}
    >
      {Icon && (
        <div className="w-12 h-12 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 mb-4">
          {typeof Icon === 'function' ? <Icon className="w-6 h-6" /> : Icon}
        </div>
      )}
      <h4 className="text-sm sm:text-base font-bold text-zinc-950 tracking-tight">{title}</h4>
      {description && (
        <p className="text-xs font-medium text-zinc-600 mt-1 max-w-sm leading-relaxed">{description}</p>
      )}
      {actionLabel && onAction && (
        <div className="mt-5">
          <Button onClick={onAction} size="sm">
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
