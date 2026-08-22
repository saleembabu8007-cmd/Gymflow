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
            const icons = {
              success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
              error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
              warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
              info: <Info className="w-5 h-5 text-sky-500 shrink-0" />,
            };

            const bgBorders = {
              success: 'bg-emerald-50 border-emerald-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)]',
              error: 'bg-rose-50 border-rose-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)]',
              warning: 'bg-amber-50 border-amber-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)]',
              info: 'bg-sky-50 border-sky-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)]',
            };

            const textColors = {
              success: 'text-emerald-900',
              error: 'text-rose-900',
              warning: 'text-amber-900',
              info: 'text-sky-900',
            };
            
            const messageColors = {
              success: 'text-emerald-700',
              error: 'text-rose-700',
              warning: 'text-amber-700',
              info: 'text-sky-700',
            };

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                transition={{ duration: 0.3, type: 'spring', bounce: 0.25 }}
                id={`toast-${toast.id}`}
                className={cn(
                  'pointer-events-auto p-4 rounded-[16px] border flex items-start gap-3 transition-all w-full',
                  bgBorders[toast.type]
                )}
              >
                {icons[toast.type]}
                <div className="flex-1 min-w-0 pt-0.5">
                  <h4 className={cn("text-[15px] font-bold leading-tight tracking-tight", textColors[toast.type])}>
                    {toast.title}
                  </h4>
                  {toast.message && (
                    <p className={cn("text-[13px] font-medium mt-1 leading-relaxed", messageColors[toast.type])}>
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
