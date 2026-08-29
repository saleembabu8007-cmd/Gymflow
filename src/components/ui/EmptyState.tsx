import React from 'react';
import { cn } from '../../utils/classNames';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ElementType | React.ReactNode;
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
  const renderIcon = () => {
    if (!Icon) return null;
    if (React.isValidElement(Icon)) {
      return Icon;
    }
    const IconComponent = Icon as React.ElementType;
    return <IconComponent className="w-7 h-7 stroke-[1.5]" />;
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 sm:p-12 select-none font-sans',
        className
      )}
    >
      {Icon && (
        <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 mb-4 border border-neutral-200/80 shadow-2xs">
          {renderIcon()}
        </div>
      )}
      <h3 className="text-base sm:text-lg font-bold text-neutral-950 tracking-tight font-display">
        {title}
      </h3>
      {description && (
        <p className="text-xs sm:text-sm text-neutral-500 mt-1.5 max-w-sm leading-relaxed">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <div className="mt-5">
          <Button onClick={onAction} variant="primary" size="sm" className="px-5 shadow-2xs">
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
