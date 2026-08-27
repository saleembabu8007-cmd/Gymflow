import React, { useEffect } from 'react';
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
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-zinc-950/40 backdrop-blur-xs"
          />

          {/* Sheet Surface */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl border border-zinc-200 z-10 max-h-[85vh] flex flex-col overflow-hidden pb-6 sm:pb-0'
            )}
          >
            {/* Grab handle for mobile */}
            <div className="w-12 h-1.5 bg-zinc-300 rounded-full mx-auto my-3 sm:hidden shrink-0" />

            {(title || showCloseButton) && (
              <div className="flex items-center justify-between px-6 pb-3 sm:py-4 border-b border-zinc-100 shrink-0">
                <div>
                  {title && <h3 className="text-sm sm:text-base font-bold text-zinc-950 tracking-tight">{title}</h3>}
                  {description && <p className="text-xs font-medium text-zinc-600 mt-0.5">{description}</p>}
                </div>
                {showCloseButton && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-zinc-400 hover:text-zinc-600 w-11 h-11 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg hover:bg-zinc-100 transition-colors"
                  >
                    <X className="w-5 h-5 sm:w-4 sm:h-4" />
                  </button>
                )}
              </div>
            )}

            <div className="p-6 overflow-y-auto">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
