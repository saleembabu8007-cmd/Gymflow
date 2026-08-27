import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../utils/classNames';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  id?: string;
  label?: string;
  helperText?: string;
  error?: string;
  options: SelectOption[];
  value: string | number;
  onChange: (value: string) => void;
  leftIcon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  id,
  label,
  helperText,
  error,
  options,
  value,
  onChange,
  leftIcon,
  disabled,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const optionsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
  const errorId = error && selectId ? `${selectId}-error` : undefined;
  const helperId = helperText && selectId ? `${selectId}-helper` : undefined;

  const selectedOptionIndex = options.findIndex((opt) => String(opt.value) === String(value));
  const selectedOption = selectedOptionIndex >= 0 ? options[selectedOptionIndex] : undefined;

  // Update position of the portal
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const updatePosition = () => {
        if (buttonRef.current) {
          const rect = buttonRef.current.getBoundingClientRect();
          setDropdownStyle({
            position: 'fixed',
            top: rect.bottom + 4,
            left: rect.left,
            width: rect.width,
          });
        }
      };

      updatePosition();
      
      // Use capture phase to catch scroll events on any parent container (like Modals)
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current && 
        !containerRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest('[data-select-portal]')
      ) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setFocusedIndex(selectedOptionIndex >= 0 ? selectedOptionIndex : 0);
    }
  }, [isOpen, selectedOptionIndex]);

  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && optionsRef.current[focusedIndex]) {
      optionsRef.current[focusedIndex]?.focus();
    }
  }, [focusedIndex, isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        buttonRef.current?.focus();
        break;
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => (prev < options.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0 && !options[focusedIndex].disabled) {
          onChange(String(options[focusedIndex].value));
          setIsOpen(false);
          buttonRef.current?.focus();
        }
        break;
      case 'Tab':
        setIsOpen(false);
        break;
    }
  };

  return (
    <div className={cn("w-full flex flex-col gap-1.5", className)} ref={containerRef}>
      {label && (
        <label htmlFor={selectId} className="text-[12px] font-medium text-neutral-500 select-none">
          {label}
        </label>
      )}
      
      <div className="relative w-full">
        <button
          ref={buttonRef}
          type="button"
          id={selectId}
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className={cn(
            'w-full min-h-[44px] bg-white border rounded-[var(--radius-md)] text-[length:var(--text-body-size)] font-semibold text-neutral-900 transition-colors flex items-center justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:border-brand-500 disabled:opacity-50 disabled:cursor-not-allowed',
            leftIcon ? 'pl-10 pr-3' : 'px-3',
            error ? 'border-danger-500 text-danger-900' : 'border-neutral-200 hover:border-neutral-300',
            isOpen && 'border-brand-500 ring-1 ring-brand-500'
          )}
        >
          {leftIcon && (
            <div className="absolute left-3 text-neutral-400 pointer-events-none flex items-center justify-center">
              {leftIcon}
            </div>
          )}
          
          <span className="truncate">
            {selectedOption ? selectedOption.label : 'Select an option'}
          </span>
          
          <ChevronDown className={cn("w-4 h-4 text-neutral-400 transition-transform duration-[var(--duration-standard)]", isOpen && "rotate-180")} />
        </button>

        {typeof document !== 'undefined' && createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                data-select-portal
                style={dropdownStyle}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2, ease: [0.0, 0.0, 0.2, 1] }}
                className="z-[9999] bg-white border border-neutral-100 rounded-[var(--radius-lg)] py-1 shadow-[var(--shadow-overlay)] overflow-hidden"
              >
                <div className="max-h-60 overflow-y-auto flex flex-col" role="listbox">
                  {options.length === 0 ? (
                    <div className="px-3 py-3 text-[14px] text-neutral-500 text-center">
                      No options available
                    </div>
                  ) : (
                    options.map((opt, i) => {
                      const isSelected = String(opt.value) === String(value);
                      return (
                        <button
                          key={String(opt.value)}
                          ref={(el) => { optionsRef.current[i] = el; }}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          disabled={opt.disabled}
                          onKeyDown={handleKeyDown}
                          onClick={() => {
                            onChange(String(opt.value));
                            setIsOpen(false);
                            buttonRef.current?.focus();
                          }}
                          className={cn(
                            "w-full px-3 py-2.5 min-h-[44px] text-left text-[length:var(--text-body-size)] flex items-center justify-between transition-colors disabled:opacity-50 focus:outline-none focus:bg-neutral-100",
                            isSelected 
                              ? "bg-[var(--color-brand-100)] text-[var(--color-brand-900)] font-bold" 
                              : "text-neutral-700 font-medium hover:bg-neutral-50 hover:text-neutral-900"
                          )}
                        >
                          <span className="truncate">{opt.label}</span>
                          {isSelected && <Check className="w-4 h-4 text-[var(--color-brand-600)]" />}
                        </button>
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
      </div>

      {error ? (
        <p id={errorId} role="alert" aria-live="polite" className="text-[length:var(--text-micro-size)] text-[var(--color-danger-600)] font-[var(--text-micro-weight)] flex items-center gap-1 mt-0.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </p>
      ) : helperText ? (
        <p id={helperId} className="text-[length:var(--text-micro-size)] font-[var(--text-micro-weight)] text-neutral-500 mt-0.5">
          {helperText}
        </p>
      ) : null}
    </div>
  );
};
