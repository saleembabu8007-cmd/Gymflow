import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '../../utils/classNames';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (toast: Omit<ToastItem, 'id'>) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type, title, message, duration = 4000 }: Omit<ToastItem, 'id'>) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const newToast: ToastItem = { id, type, title, message, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }
    },
    [dismissToast]
  );

  const success = useCallback((title: string, message?: string) => showToast({ type: 'success', title, message }), [showToast]);
  const error = useCallback((title: string, message?: string) => showToast({ type: 'error', title, message }), [showToast]);
  const warning = useCallback((title: string, message?: string) => showToast({ type: 'warning', title, message }), [showToast]);
  const info = useCallback((title: string, message?: string) => showToast({ type: 'info', title, message }), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info, dismissToast }}>
      {children}
      <div
        id="toast-portal-container"
        className="fixed bottom-6 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-8 z-[100] flex flex-col gap-3 max-w-sm w-[calc(100vw-32px)] sm:w-full pointer-events-none"
      >
        <AnimatePresence>
          {toasts.map((toast) => {
            const isError = toast.type === 'error';
            const icons = {
              success: <CheckCircle2 className="w-5 h-5 text-[var(--color-success-500)] shrink-0" />,
              error: <AlertCircle className="w-5 h-5 text-[var(--color-danger-500)] shrink-0" />,
              warning: <AlertTriangle className="w-5 h-5 text-[var(--color-warning-500)] shrink-0" />,
              info: <Info className="w-5 h-5 text-[var(--color-info-500)] shrink-0" />,
            };

            const bgBorders = {
              success: 'bg-[var(--color-success-50)] border-[var(--color-success-200)] shadow-[var(--shadow-overlay)]',
              error: 'bg-[var(--color-danger-50)] border-[var(--color-danger-200)] shadow-[var(--shadow-overlay)]',
              warning: 'bg-[var(--color-warning-50)] border-[var(--color-warning-200)] shadow-[var(--shadow-overlay)]',
              info: 'bg-[var(--color-info-50)] border-[var(--color-info-200)] shadow-[var(--shadow-overlay)]',
            };

            const textColors = {
              success: 'text-[var(--color-success-900)]',
              error: 'text-[var(--color-danger-900)]',
              warning: 'text-[var(--color-warning-900)]',
              info: 'text-[var(--color-info-900)]',
            };
            
            const messageColors = {
              success: 'text-[var(--color-success-700)]',
              error: 'text-[var(--color-danger-700)]',
              warning: 'text-[var(--color-warning-700)]',
              info: 'text-[var(--color-info-700)]',
            };

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                transition={{ duration: 0.3, type: 'spring', bounce: 0.25 }}
                id={`toast-${toast.id}`}
                role="status"
                aria-live={isError ? 'assertive' : 'polite'}
                className={cn(
                  'pointer-events-auto p-4 rounded-[var(--radius-lg)] border flex items-start gap-3 w-full motion-reduce:transition-none motion-reduce:animate-none',
                  bgBorders[toast.type]
                )}
              >
                {icons[toast.type]}
                <div className="flex-1 min-w-0 pt-0.5">
                  <h4 className={cn("text-[length:var(--text-body-size)] font-bold leading-tight tracking-tight", textColors[toast.type])}>
                    {toast.title}
                  </h4>
                  {toast.message && (
                    <p className={cn("text-[length:var(--text-caption-size)] font-medium mt-1 leading-relaxed", messageColors[toast.type])}>
                      {toast.message}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  id={`toast-close-${toast.id}`}
                  onClick={() => dismissToast(toast.id)}
                  className={cn("p-1.5 rounded-full transition-colors hover:bg-black/5 opacity-70 hover:opacity-100", textColors[toast.type])}
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
