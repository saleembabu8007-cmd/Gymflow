import React from 'react';
import { PaymentStatus } from '../../types';
import { getStatusConfig } from '../../utils/statusUtils';
import { cn } from '../../utils/classNames';
import { AlertCircle, Clock, CheckCircle2, XCircle } from 'lucide-react';

export interface StatusBadgeProps {
  status: PaymentStatus;
  customLabel?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  customLabel,
  showIcon = true,
  size = 'md',
  className,
}) => {
  const config = getStatusConfig(status);

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1 font-semibold',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-semibold',
  };

  const renderStatusIcon = () => {
    switch (status) {
      case 'OVERDUE':
        return <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" />;
      case 'DUE_TODAY':
        return <Clock className="w-3 h-3 text-amber-600 shrink-0" />;
      case 'DUE_SOON':
        return <Clock className="w-3 h-3 text-sky-600 shrink-0" />;
      case 'PAID':
        return <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />;
      case 'EXPIRED':
        return <XCircle className="w-3 h-3 text-zinc-500 shrink-0" />;
      default:
        return <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', config.dotClass)} />;
    }
  };

  const textLabel = customLabel || config.label;

  return (
    <span
      aria-label={`Status: ${textLabel}`}
      className={cn(
        'inline-flex items-center whitespace-nowrap select-none transition-colors font-mono tracking-tight uppercase',
        config.bgClass,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && renderStatusIcon()}
      <span>{textLabel}</span>
    </span>
  );
};
