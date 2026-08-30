import React from 'react';
import { cn } from '../../utils/classNames';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  id,
  className,
}) => {
  const switchId = id || (label ? `switch-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <label
      htmlFor={switchId}
      className={cn(
        'inline-flex items-center justify-between gap-3 select-none cursor-pointer font-sans',
        disabled && 'cursor-not-allowed opacity-50'
      )}
    >
      {(label || description) && (
        <div className="flex flex-col min-w-0 flex-1">
          {label && <span className="text-xs font-semibold text-neutral-900 truncate leading-tight">{label}</span>}
          {description && <span className="text-[11px] font-medium text-neutral-500 truncate mt-0.5">{description}</span>}
        </div>
      )}

      <button
        type="button"
        role="switch"
        id={switchId}
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-[var(--duration-fast)] ease-in-out focus-visible:outline-2 focus-visible:outline-neutral-950 focus-visible:outline-offset-2',
          checked ? 'bg-neutral-950' : 'bg-neutral-200',
          disabled && 'cursor-not-allowed',
          className
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white border border-neutral-200 shadow-2xs ring-0 transition duration-[var(--duration-fast)] ease-in-out',
            checked ? 'translate-x-4' : 'translate-x-0'
          )}
        />
      </button>
    </label>
  );
};
