import React from 'react';
import { cn } from '../../utils/classNames';
import { AlertCircle } from 'lucide-react';

export interface HelperTextProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export const HelperText: React.FC<HelperTextProps> = ({ children, className, ...props }) => {
  if (!children) return null;
  return (
    <p className={cn('text-[12px] font-medium text-neutral-500 mt-0.5 select-none', className)} {...props}>
      {children}
    </p>
  );
};

export interface ErrorTextProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export const ErrorText: React.FC<ErrorTextProps> = ({ children, className, ...props }) => {
  if (!children) return null;
  return (
    <p
      role="alert"
      aria-live="polite"
      className={cn('text-[12px] font-medium text-[var(--color-danger-600)] flex items-center gap-1.5 mt-0.5', className)}
      {...props}
    >
      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
};
