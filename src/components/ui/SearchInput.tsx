import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { cn } from '../../utils/classNames';
import { useDebounce } from '../../hooks/useDebounce';

export interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string;
  onSearchChange?: (value: string) => void;
  debounceMs?: number;
  isLoading?: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  className,
  value: controlledValue,
  onSearchChange,
  debounceMs = 250,
  isLoading = false,
  placeholder = 'Search by name or phone...',
  ...props
}) => {
  const [internalValue, setInternalValue] = useState(controlledValue || '');
  const debouncedValue = useDebounce(internalValue, debounceMs);

  const onSearchChangeRef = useRef(onSearchChange);
  onSearchChangeRef.current = onSearchChange;
  
  const isFirstRender = useRef(true);
  const lastNotifiedValue = useRef<string>(controlledValue || '');

  useEffect(() => {
    if (controlledValue !== undefined && controlledValue !== internalValue) {
      setInternalValue(controlledValue);
      lastNotifiedValue.current = controlledValue;
    }
  }, [controlledValue]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (lastNotifiedValue.current !== debouncedValue) {
      lastNotifiedValue.current = debouncedValue;
      onSearchChangeRef.current?.(debouncedValue);
    }
  }, [debouncedValue]);

  const handleClear = () => {
    setInternalValue('');
    lastNotifiedValue.current = '';
    onSearchChangeRef.current?.('');
  };

  return (
    <div className={cn('relative flex items-center w-full group shrink-0', className)}>
      <div className="absolute left-3.5 text-[var(--color-brand-500)] pointer-events-none flex items-center justify-center transition-colors">
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4 stroke-[2.5]" />}
      </div>
      <input
        type="text"
        value={internalValue}
        onChange={(e) => setInternalValue(e.target.value)}
        placeholder={placeholder}
        className="w-full h-11 pl-[38px] pr-9 rounded-full bg-neutral-100 border-2 border-transparent text-[length:var(--text-body-size)] font-medium text-neutral-900 placeholder:text-neutral-500 placeholder:font-normal transition-all focus:outline-none focus:bg-white focus:border-[var(--color-brand-500)] focus:ring-4 focus:ring-[var(--color-brand-500)]/10 hover:bg-neutral-200"
        {...props}
      />
      {internalValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 p-1.5 rounded-full bg-neutral-200 text-neutral-600 hover:text-neutral-700 hover:bg-neutral-300 focus:outline-none transition-colors cursor-pointer"
          title="Clear search"
        >
          <X className="w-3.5 h-3.5 stroke-[3]" />
        </button>
      )}
    </div>
  );
};
