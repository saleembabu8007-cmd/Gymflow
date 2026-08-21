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
    <div className={cn('relative flex items-center w-full', className)}>
      <div className="absolute left-3.5 text-zinc-400 pointer-events-none flex items-center justify-center">
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
      </div>
      <input
        type="text"
        value={internalValue}
        onChange={(e) => setInternalValue(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 pl-10 pr-9 rounded-xl bg-white border border-zinc-200 text-sm font-semibold text-zinc-900 placeholder:text-zinc-400 transition-colors focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
        {...props}
      />
      {internalValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 p-1 rounded-md text-zinc-400 hover:text-zinc-600 focus:outline-none transition-colors cursor-pointer"
          title="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
