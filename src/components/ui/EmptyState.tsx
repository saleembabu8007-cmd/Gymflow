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
        'flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/50',
        className
      )}
    >
      {Icon && (
        <div className="w-12 h-12 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex items-center justify-center text-neutral-400 mb-4">
          {typeof Icon === 'function' ? <Icon className="w-6 h-6" /> : Icon}
        </div>
      )}
      <h4 className="text-base font-semibold text-neutral-900">{title}</h4>
      {description && (
        <p className="text-sm text-neutral-500 mt-1 max-w-sm leading-relaxed">{description}</p>
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
