import React from 'react';
import { cn } from '../../utils/classNames';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  errorText?: string;
  required?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      helperText,
      errorText,
      required,
      disabled,
      className,
      id,
      value,
      rows = 3,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? `textarea-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-bold text-neutral-900 select-none">
            {label}
            {required && <span className="text-rose-600 ml-1" title="Required">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          id={inputId}
          disabled={disabled}
          rows={rows}
          value={value}
          className={cn(
            'w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-950 placeholder-neutral-400 transition-all duration-150 resize-y',
            'focus:outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10',
            errorText && 'border-rose-400 focus:border-rose-600 focus:ring-rose-500/10 bg-rose-50/20',
            disabled && 'bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed resize-none',
            className
          )}
          {...props}
        />

        {errorText ? (
          <p className="text-xs font-medium text-rose-600 animate-in fade-in-50">{errorText}</p>
        ) : helperText ? (
          <p className="text-xs text-neutral-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
