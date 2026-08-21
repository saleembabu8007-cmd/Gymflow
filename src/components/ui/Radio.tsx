import React from 'react';
import { cn } from '../../utils/classNames';

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ label, description, className, disabled, checked, id, onChange, ...props }, ref) => {
    const inputId = id || (label ? `radio-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <label
        htmlFor={inputId}
        className={cn(
          'inline-flex items-start gap-2.5 select-none cursor-pointer group',
          disabled && 'cursor-not-allowed opacity-60'
        )}
      >
        <div className="relative flex items-center justify-center pt-0.5">
          <input
            ref={ref}
            type="radio"
            id={inputId}
            checked={checked}
            disabled={disabled}
            onChange={onChange}
            className="sr-only peer"
            {...props}
          />
          <div
            className={cn(
              'w-4 h-4 rounded-full border border-zinc-300 bg-white transition-all flex items-center justify-center duration-150',
              'peer-checked:border-zinc-950',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-zinc-950 peer-focus-visible:ring-offset-2',
              'group-hover:border-zinc-400',
              className
            )}
          >
            {checked && <div className="w-2 h-2 rounded-full bg-zinc-950" />}
          </div>
        </div>

        {(label || description) && (
          <div className="flex flex-col">
            {label && <span className="text-xs font-semibold text-neutral-900">{label}</span>}
            {description && <span className="text-[11px] text-neutral-500">{description}</span>}
          </div>
        )}
      </label>
    );
  }
);

Radio.displayName = 'Radio';
