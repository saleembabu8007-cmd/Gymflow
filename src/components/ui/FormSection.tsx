import React from 'react';
import { cn } from '../../utils/classNames';

export interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children,
  className,
}) => {
  return (
    <div className={cn('space-y-4 py-3 first:pt-0 last:pb-0', className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && <h3 className="text-sm font-bold text-neutral-900 tracking-tight">{title}</h3>}
          {description && <p className="text-xs text-neutral-500">{description}</p>}
        </div>
      )}
      <div className="space-y-3.5">{children}</div>
    </div>
  );
};

export interface FormRowProps {
  children: React.ReactNode;
  cols?: 2 | 3;
  className?: string;
}

export const FormRow: React.FC<FormRowProps> = ({ children, cols = 2, className }) => {
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-3.5',
        cols === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3',
        className
      )}
    >
      {children}
    </div>
  );
};

export interface FormActionsProps {
  children: React.ReactNode;
  sticky?: boolean;
  className?: string;
}

export const FormActions: React.FC<FormActionsProps> = ({
  children,
  sticky = false,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-3 pt-4 border-t border-neutral-200/80',
        sticky && 'sticky bottom-0 bg-white/95 backdrop-blur-xs py-3 -mx-6 px-6 -mb-6',
        className
      )}
    >
      {children}
    </div>
  );
};
