import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CaretDown, Check } from '@phosphor-icons/react';
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
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
  const errorId = error && selectId ? `${selectId}-error` : undefined;
  const helperId = helperText && selectId ? `${selectId}-helper` : undefined;

  const selectedOption = options.find((opt) => String(opt.value) === String(value));

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
      // Check if click is outside the main container AND outside the portal
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
          className={cn(
            'w-full h-10 bg-white border rounded-[12px] text-[14px] font-semibold text-neutral-900 transition-colors flex items-center justify-between shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed',
            leftIcon ? 'pl-10 pr-3' : 'px-3',
            error ? 'border-rose-500 text-rose-900' : 'border-neutral-200 hover:border-neutral-300',
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
          
          <CaretDown weight="regular" className={cn("w-4 h-4 text-neutral-400 transition-transform", isOpen && "rotate-180")} />
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
                className="z-[9999] bg-white border border-neutral-100 rounded-[12px] py-1 shadow-[0_24px_48px_rgba(15,23,42,0.12),0_12px_24px_rgba(15,23,42,0.08)] overflow-hidden"
              >
                <div className="max-h-60 overflow-y-auto flex flex-col">
                  {options.length === 0 ? (
                    <div className="px-3 py-3 text-[14px] text-neutral-500 text-center">
                      No options available
                    </div>
                  ) : (
                    options.map((opt) => {
                      const isSelected = String(opt.value) === String(value);
                      return (
                        <button
                          key={String(opt.value)}
                          type="button"
                          disabled={opt.disabled}
                          onClick={() => {
                            onChange(String(opt.value));
                            setIsOpen(false);
                          }}
                          className={cn(
                            "w-full px-3 py-2 text-left text-[14px] flex items-center justify-between transition-colors disabled:opacity-50",
                            isSelected 
                              ? "bg-brand-50 text-brand-900 font-bold" 
                              : "text-neutral-700 font-medium hover:bg-neutral-50 hover:text-neutral-900"
                          )}
                        >
                          <span className="truncate">{opt.label}</span>
                          {isSelected && <Check weight="bold" className="w-4 h-4 text-brand-600" />}
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
        <p id={errorId} className="text-[12px] text-rose-600 font-medium">
          {error}
        </p>
      ) : helperText ? (
        <p id={helperId} className="text-[12px] font-medium text-neutral-500">
          {helperText}
        </p>
      ) : null}
    </div>
  );
};
