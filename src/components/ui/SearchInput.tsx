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
    <div className={cn('relative flex items-center w-full group', className)}>
      <div className="absolute left-4 text-teal-600 pointer-events-none flex items-center justify-center transition-colors">
        {isLoading ? <Loader2 className="w-[18px] h-[18px] animate-spin" /> : <Search className="w-[18px] h-[18px] stroke-[2.5]" />}
      </div>
      <input
        type="text"
        value={internalValue}
        onChange={(e) => setInternalValue(e.target.value)}
        placeholder={placeholder}
        className="w-full h-[46px] pl-[42px] pr-10 rounded-full bg-slate-100/80 border-2 border-transparent text-[15px] font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal transition-all focus:outline-none focus:border-teal-500 focus:bg-white focus:shadow-[0_0_0_4px_rgba(20,184,166,0.1)] hover:bg-slate-100"
        {...props}
      />
      {internalValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 p-1.5 rounded-full bg-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-300 focus:outline-none transition-colors cursor-pointer"
          title="Clear search"
        >
          <X className="w-3.5 h-3.5 stroke-[3]" />
        </button>
      )}
    </div>
  );
};
