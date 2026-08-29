import React from 'react';
import { Badge } from './Badge';
import { Check, Clock, AlertTriangle, AlertCircle, Sparkles } from 'lucide-react';

export type DomainStatus = 
  | 'PAID' 
  | 'DUE_TODAY' 
  | 'DUE_SOON' 
  | 'OVERDUE' 
  | 'EXPIRED' 
  | 'ACTIVE' 
  | 'INACTIVE' 
  | 'PENDING'
  | string;

export interface StatusBadgeProps {
  status: DomainStatus;
  customLabel?: string;
  showIcon?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  customLabel,
  showIcon = true,
  className,
}) => {
  const normalizedStatus = (status || '').toUpperCase();

  const getStatusConfig = () => {
    switch (normalizedStatus) {
      case 'OVERDUE':
        return {
          label: 'Overdue',
          variant: 'danger' as const,
          treatment: 'emphasis' as const,
          icon: <AlertCircle className="w-3 h-3" />,
        };
      case 'DUE_TODAY':
        return {
          label: 'Due Today',
          variant: 'warning' as const,
          treatment: 'emphasis' as const,
          icon: <AlertTriangle className="w-3 h-3" />,
        };
      case 'DUE_SOON':
        return {
          label: 'Due Soon',
          variant: 'warning' as const,
          treatment: 'default' as const,
          icon: <Clock className="w-3 h-3" />,
        };
      case 'PAID':
        return {
          label: 'Paid',
          variant: 'success' as const,
          treatment: 'default' as const,
          icon: <Check className="w-3 h-3" />,
        };
      case 'ACTIVE':
        return {
          label: 'Active',
          variant: 'success' as const,
          treatment: 'emphasis' as const,
          icon: <Sparkles className="w-3 h-3" />,
        };
      case 'EXPIRED':
        return {
          label: 'Expired',
          variant: 'neutral' as const,
          treatment: 'emphasis' as const,
          icon: undefined,
        };
      case 'INACTIVE':
        return {
          label: 'Inactive',
          variant: 'neutral' as const,
          treatment: 'default' as const,
          icon: undefined,
        };
      case 'PENDING':
        return {
          label: 'Pending',
          variant: 'info' as const,
          treatment: 'emphasis' as const,
          icon: <Clock className="w-3 h-3" />,
        };
      default:
        return {
          label: normalizedStatus || 'Unknown',
          variant: 'neutral' as const,
          treatment: 'default' as const,
          icon: undefined,
        };
    }
  };

  const config = getStatusConfig();
  const displayLabel = customLabel || config.label;

  return (
    <Badge
      variant={config.variant}
      treatment={config.treatment}
      icon={showIcon ? config.icon : null}
      className={className}
    >
      {displayLabel}
    </Badge>
  );
};
