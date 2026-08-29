import React from 'react';
import { cn } from '../../utils/classNames';
import { Check, AlertCircle } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  success?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  prefixText?: string;
  suffixText?: string;
  labelClassName?: string;
  variant?: 'light' | 'dark';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      labelClassName,
      variant,
      label,
      helperText,
      error,
      success,
      leftIcon,
      rightIcon,
      prefixText,
      suffixText,
      id,
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    const cleanLabel = label?.replace(/\s*\*\s*$/, '');
    const inputId = id || (cleanLabel ? `input-${cleanLabel.toLowerCase().replace(/\s+/g, '-')}` : undefined);
    const errorId = error && inputId ? `${inputId}-error` : undefined;
    const helperId = helperText && inputId ? `${inputId}-helper` : undefined;
    const describedBy = error ? errorId : (helperText ? helperId : undefined);

    const wrapperClasses = cn(
      'relative flex items-center w-full min-h-[40px] bg-white border rounded-[var(--radius-md)] transition-all shadow-2xs',
      disabled && 'opacity-50 bg-neutral-50 cursor-not-allowed',
      error
        ? 'border-[var(--color-danger-500)] focus-within:border-[var(--color-danger-500)] focus-within:ring-2 focus-within:ring-[var(--color-danger-500)]/15'
        : 'border-neutral-200/80 focus-within:border-neutral-950 focus-within:ring-2 focus-within:ring-neutral-950/10'
    );

    return (
      <div className={cn('w-full flex flex-col gap-1.5', className)}>
        {cleanLabel && (
          <label
            htmlFor={inputId}
            className={cn('text-[length:var(--text-caption-size)] font-semibold text-neutral-700 flex items-center select-none', labelClassName)}
          >
            {cleanLabel}
            {required && <span className="text-[var(--color-danger-500)] ml-0.5" aria-hidden="true">*</span>}
          </label>
        )}
        <div className={wrapperClasses}>
          {leftIcon && (
            <div className="absolute left-3 text-neutral-400 pointer-events-none flex items-center justify-center">
              {leftIcon}
            </div>
          )}
          {prefixText && (
            <span className={cn('absolute left-3 text-[length:var(--text-body-size)] font-medium text-neutral-600 pointer-events-none select-none', prefixText === '₹' && 'tabular-nums', leftIcon && 'left-9')}>
              {prefixText}
            </span>
          )}

          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            className={cn(
              'w-full h-[40px] bg-transparent text-[length:var(--text-body-size)] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-0 focus-visible:outline-none disabled:cursor-not-allowed',
              leftIcon ? (prefixText ? 'pl-14' : 'pl-10') : (prefixText ? 'pl-8' : 'pl-3'),
              rightIcon ? (suffixText ? 'pr-14' : 'pr-10') : (suffixText ? 'pr-8' : 'pr-3'),
              success ? 'pr-10' : '',
              prefixText === '₹' && 'tabular-nums'
            )}
            {...props}
          />

          {success && !error && !rightIcon && (
            <div className="absolute right-3 text-[var(--color-success-500)] pointer-events-none flex items-center justify-center">
              <Check className="w-4 h-4" />
            </div>
          )}
          {suffixText && (
            <span className={cn('absolute right-3 text-[length:var(--text-body-size)] font-medium text-neutral-600 pointer-events-none select-none', rightIcon && 'right-9')}>
              {suffixText}
            </span>
          )}
          {rightIcon && (
            <div className="absolute right-3 text-neutral-400 flex items-center justify-center">
              {rightIcon}
            </div>
          )}
        </div>

        {error ? (
          <p id={errorId} role="alert" aria-live="polite" className="text-[12px] font-medium text-[var(--color-danger-600)] flex items-center gap-1.5 mt-0.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-[12px] font-medium text-neutral-500 mt-0.5">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
