import { formatDate, getDifferenceInDays, formatToISODate } from '../../utils/dateUtils';

/**
 * Domain Logic: Membership Durations & Expiration Calculations
 */

export function calculateNextPaymentDate(startDateStr: string, durationMonths: number = 1): string {
  const start = new Date(startDateStr);
  if (isNaN(start.getTime())) {
    const today = new Date();
    today.setMonth(today.getMonth() + durationMonths);
    return formatToISODate(today);
  }

  const nextDate = new Date(start.getFullYear(), start.getMonth() + durationMonths, start.getDate());
  return formatToISODate(nextDate);
}

export function getDaysUntilExpiration(nextPaymentDateStr: string): number {
  return getDifferenceInDays(nextPaymentDateStr);
}

export function isMembershipExpired(nextPaymentDateStr: string): boolean {
  return getDaysUntilExpiration(nextPaymentDateStr) < 0;
}

export function isMembershipDueToday(nextPaymentDateStr: string): boolean {
  return getDaysUntilExpiration(nextPaymentDateStr) === 0;
}

export function isMembershipDueSoon(nextPaymentDateStr: string, windowDays: number = 3): boolean {
  const days = getDaysUntilExpiration(nextPaymentDateStr);
  return days > 0 && days <= windowDays;
}
