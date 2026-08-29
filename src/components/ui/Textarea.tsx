import React from 'react';
import { cn } from '../../utils/classNames';
import { AlertCircle } from 'lucide-react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  errorText?: string;
  required?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      helperText,
      error,
      errorText,
      required,
      disabled,
      className,
      id,
      rows = 3,
      ...props
    },
    ref
  ) => {
    const activeError = error || errorText;
    const cleanLabel = label?.replace(/\s*\*\s*$/, '');
    const inputId = id || (cleanLabel ? `textarea-${cleanLabel.toLowerCase().replace(/\s+/g, '-')}` : undefined);
    const errorId = activeError && inputId ? `${inputId}-error` : undefined;
    const helperId = helperText && inputId ? `${inputId}-helper` : undefined;
    const describedBy = activeError ? errorId : (helperText ? helperId : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {cleanLabel && (
          <label
            htmlFor={inputId}
            className="text-[length:var(--text-caption-size)] font-semibold text-neutral-700 flex items-center select-none"
          >
            {cleanLabel}
            {required && <span className="text-[var(--color-danger-500)] ml-0.5" aria-hidden="true">*</span>}
          </label>
        )}

        <div
          className={cn(
            'relative flex items-center w-full bg-white border rounded-[var(--radius-md)] transition-all shadow-2xs',
            disabled && 'opacity-50 bg-neutral-50 cursor-not-allowed',
            activeError
              ? 'border-[var(--color-danger-500)] focus-within:border-[var(--color-danger-500)] focus-within:ring-2 focus-within:ring-[var(--color-danger-500)]/15'
              : 'border-neutral-200/80 focus-within:border-neutral-950 focus-within:ring-2 focus-within:ring-neutral-950/10'
          )}
        >
          <textarea
            ref={ref}
            id={inputId}
            disabled={disabled}
            rows={rows}
            required={required}
            aria-invalid={Boolean(activeError)}
            aria-describedby={describedBy}
            className={cn(
              'w-full p-3 bg-transparent text-[length:var(--text-body-size)] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-0 focus-visible:outline-none disabled:cursor-not-allowed resize-y',
              className
            )}
            {...props}
          />
        </div>

        {activeError ? (
          <p id={errorId} role="alert" aria-live="polite" className="text-[12px] font-medium text-[var(--color-danger-600)] flex items-center gap-1.5 mt-0.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {activeError}
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

Textarea.displayName = 'Textarea';
