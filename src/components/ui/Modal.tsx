import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '../../utils/classNames';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
  showCloseButton = true,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  const titleId = title ? `modal-title-${title.toLowerCase().replace(/\s+/g, '-')}` : undefined;
  const descriptionId = description ? `modal-desc-${description.toLowerCase().replace(/\s+/g, '-')}` : undefined;

  useEffect(() => {
    if (!isOpen) return;

    // 1. Store triggering element to restore focus upon close
    previousActiveElementRef.current = document.activeElement as HTMLElement;

    // 2. Lock body scrolling
    document.body.style.overflow = 'hidden';

    // 3. Focus first focusable element or modal container
    const timer = setTimeout(() => {
      if (modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        } else {
          modalRef.current.focus();
        }
      }
    }, 50);

    // 4. Keyboard dismissal & Focus trapping
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusables = Array.from(
          modalRef.current.querySelectorAll<HTMLElement>(
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

      // Restore focus to original triggering element
      if (previousActiveElementRef.current && typeof previousActiveElementRef.current.focus === 'function') {
        previousActiveElementRef.current.focus();
      }
    };
  }, [isOpen, onClose]);

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col sm:items-center sm:justify-center p-0 sm:p-6 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal Card */}
          <motion.div
            ref={modalRef}
            tabIndex={-1}
            initial={{ opacity: 0, y: 100, scale: 1 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 1 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'relative w-full bg-white sm:rounded-[var(--radius-xl)] rounded-t-[var(--radius-xl)] overflow-hidden sm:border border-neutral-200 z-10 flex flex-col focus:outline-none shadow-[var(--shadow-overlay)]',
              'mt-auto sm:mt-0', // Push to bottom on mobile, centered on desktop
              'max-h-[90vh] sm:max-h-[85vh]', // Max height handling
              maxWidthClasses[maxWidth]
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
          >
            {/* Mobile Drag Handle */}
            <div className="sm:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1.5 bg-neutral-200 rounded-full" />
            </div>

            {(title || showCloseButton) && (
              <div className="flex items-center justify-between px-6 pb-4 sm:py-4 border-b border-neutral-100 shrink-0">
                <div>
                  {title && (
                    <h3 id={titleId} className="text-[length:var(--text-body-size)] sm:text-[length:var(--text-heading-size)] font-bold text-neutral-900 tracking-tight">
                      {title}
                    </h3>
                  )}
                  {description && (
                    <p id={descriptionId} className="text-[length:var(--text-caption-size)] font-medium text-neutral-600 mt-0.5">
                      {description}
                    </p>
                  )}
                </div>
                {showCloseButton && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-neutral-400 hover:text-neutral-600 flex items-center justify-center min-w-[44px] min-h-[44px] rounded-full hover:bg-neutral-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}

            <div className="flex-1 overflow-y-auto min-h-0 flex flex-col">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
