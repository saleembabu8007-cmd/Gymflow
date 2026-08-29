import React from 'react';
import { cn } from '../../utils/classNames';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

export type AlertVariant = 'info' | 'warning' | 'danger' | 'success';

export interface InlineAlertProps {
  title?: string;
  children: React.ReactNode;
  variant?: AlertVariant;
  icon?: React.ReactNode;
  onDismiss?: () => void;
  action?: React.ReactNode;
  className?: string;
}

export const InlineAlert: React.FC<InlineAlertProps> = ({
  title,
  children,
  variant = 'info',
  icon,
  onDismiss,
  action,
  className,
}) => {
  const variantMap = {
    info: {
      container: 'bg-[var(--color-info-50)] border-[var(--color-info-200)] text-[var(--color-info-900)]',
      icon: <Info className="w-4 h-4 text-[var(--color-info-600)] shrink-0" />,
      titleColor: 'text-[var(--color-info-900)]',
    },
    warning: {
      container: 'bg-[var(--color-warning-50)] border-[var(--color-warning-200)] text-[var(--color-warning-900)]',
      icon: <AlertTriangle className="w-4 h-4 text-[var(--color-warning-600)] shrink-0" />,
      titleColor: 'text-[var(--color-warning-900)]',
    },
    danger: {
      container: 'bg-[var(--color-danger-50)] border-[var(--color-danger-200)] text-[var(--color-danger-900)]',
      icon: <AlertCircle className="w-4 h-4 text-[var(--color-danger-600)] shrink-0" />,
      titleColor: 'text-[var(--color-danger-900)]',
    },
    success: {
      container: 'bg-[var(--color-success-50)] border-[var(--color-success-200)] text-[var(--color-success-900)]',
      icon: <CheckCircle2 className="w-4 h-4 text-[var(--color-success-600)] shrink-0" />,
      titleColor: 'text-[var(--color-success-900)]',
    },
  };

  const current = variantMap[variant];

  return (
    <div
      role="alert"
      className={cn(
        'relative flex items-start gap-3 p-3.5 sm:p-4 rounded-[var(--radius-md)] border shadow-2xs text-sm leading-relaxed',
        current.container,
        className
      )}
    >
      <div className="pt-0.5">{icon || current.icon}</div>
      <div className="flex-1 min-w-0">
        {title && <div className={cn('font-bold text-sm mb-0.5', current.titleColor)}>{title}</div>}
        <div className="text-xs sm:text-sm font-medium opacity-90">{children}</div>
        {action && <div className="mt-2.5">{action}</div>}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss alert"
          className="w-6 h-6 rounded-full flex items-center justify-center opacity-60 hover:opacity-100 hover:bg-black/5 transition-all shrink-0 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
