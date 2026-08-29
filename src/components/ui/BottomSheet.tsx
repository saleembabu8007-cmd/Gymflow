import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '../../utils/classNames';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  showCloseButton = true,
}) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  const titleId = title ? `sheet-title-${title.toLowerCase().replace(/\s+/g, '-')}` : undefined;
  const descriptionId = description ? `sheet-desc-${description.toLowerCase().replace(/\s+/g, '-')}` : undefined;

  useEffect(() => {
    if (!isOpen) return;

    previousActiveElementRef.current = document.activeElement as HTMLElement;
    document.body.style.overflow = 'hidden';

    const timer = setTimeout(() => {
      if (sheetRef.current) {
        const focusableElements = sheetRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        } else {
          sheetRef.current.focus();
        }
      }
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab' && sheetRef.current) {
        const focusables = Array.from(
          sheetRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        );

        if (focusables.length === 0) return;

        const firstElement = focusables[0];
        const lastElement = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);

      if (previousActiveElementRef.current && typeof previousActiveElementRef.current.focus === 'function') {
        previousActiveElementRef.current.focus();
      }
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center select-none font-sans"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-neutral-950/40 backdrop-blur-xs"
            aria-hidden="true"
          />

          {/* Sheet Surface */}
          <motion.div
            ref={sheetRef}
            tabIndex={-1}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'relative w-full max-w-lg bg-white rounded-t-[var(--radius-xl)] sm:rounded-[var(--radius-xl)] border border-neutral-200/80 shadow-lg z-10 max-h-[85vh] flex flex-col overflow-hidden pb-6 sm:pb-0 focus:outline-none'
            )}
          >
            {/* Grab handle for mobile */}
            <div className="w-10 h-1 bg-neutral-300 rounded-full mx-auto my-2.5 sm:hidden shrink-0" aria-hidden="true" />

            {(title || showCloseButton) && (
              <div className="flex items-center justify-between px-5 pb-3 sm:py-3.5 border-b border-neutral-100 shrink-0">
                <div>
                  {title && (
                    <h3 id={titleId} className="text-sm sm:text-base font-bold text-neutral-950 tracking-tight font-display">
                      {title}
                    </h3>
                  )}
                  {description && (
                    <p id={descriptionId} className="text-xs font-medium text-neutral-500 mt-0.5">
                      {description}
                    </p>
                  )}
                </div>
                {showCloseButton && (
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close sheet"
                    className="text-neutral-400 hover:text-neutral-700 w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            <div className="p-5 overflow-y-auto">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
