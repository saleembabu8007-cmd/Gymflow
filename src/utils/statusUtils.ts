import { PaymentStatus, PAYMENT_STATUS } from '../types';
import { getDifferenceInDays } from './dateUtils';

/**
 * Checks if a given payment date is strictly past due (< 0 days)
 */
export function isOverdue(nextPaymentDate: string | Date): boolean {
  if (!nextPaymentDate) return false;
  return getDifferenceInDays(nextPaymentDate) < 0;
}

/**
 * Checks if a given payment date is due today (0 days difference)
 */
export function isDueToday(nextPaymentDate: string | Date): boolean {
  if (!nextPaymentDate) return false;
  return getDifferenceInDays(nextPaymentDate) === 0;
}

/**
 * Checks if a given payment date is due within the configured reminder window (e.g. 1-3 days)
 */
export function isDueSoon(nextPaymentDate: string | Date, reminderDays: number = 3): boolean {
  if (!nextPaymentDate) return false;
  const diff = getDifferenceInDays(nextPaymentDate);
  return diff > 0 && diff <= reminderDays;
}

/**
 * Derives dynamic PaymentStatus from nextPaymentDate, reminder lead days, and member active state
 */
export function calculatePaymentStatus(
  nextPaymentDate: string | Date | null | undefined,
  reminderWindowDays: number = 3,
  isActive: boolean = true
): PaymentStatus {
  if (!isActive) {
    return PAYMENT_STATUS.EXPIRED;
  }

  if (!nextPaymentDate) {
    return PAYMENT_STATUS.PAID;
  }

  const diff = getDifferenceInDays(nextPaymentDate);

  if (diff < 0) {
    return PAYMENT_STATUS.OVERDUE;
  }

  if (diff === 0) {
    return PAYMENT_STATUS.DUE_TODAY;
  }

  if (diff <= reminderWindowDays) {
    return PAYMENT_STATUS.DUE_SOON;
  }

  return PAYMENT_STATUS.PAID;
}

/**
 * Returns UI metadata for a given status
 */
export function getStatusConfig(status: PaymentStatus) {
  switch (status) {
    case PAYMENT_STATUS.OVERDUE:
      return {
        label: 'Overdue',
        variant: 'danger' as const,
        bgClass: 'text-rose-600',
        dotClass: 'bg-rose-500',
      };
    case PAYMENT_STATUS.DUE_TODAY:
      return {
        label: 'Due Today',
        variant: 'warning' as const,
        bgClass: 'text-amber-600',
        dotClass: 'bg-amber-500',
      };
    case PAYMENT_STATUS.DUE_SOON:
      return {
        label: 'Due Soon',
        variant: 'info' as const,
        bgClass: 'text-sky-600',
        dotClass: 'bg-sky-400',
      };
    case PAYMENT_STATUS.EXPIRED:
      return {
        label: 'Expired',
        variant: 'neutral' as const,
        bgClass: 'text-zinc-500',
        dotClass: 'bg-zinc-400',
      };
    case PAYMENT_STATUS.PAID:
    default:
      return {
        label: 'Paid',
        variant: 'success' as const,
        bgClass: 'text-emerald-600',
        dotClass: 'bg-emerald-500',
      };
  }
}
