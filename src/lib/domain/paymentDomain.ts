import { PaymentMethod } from '../../types';
import { calculateNextPaymentDate, formatToISODate } from '../../utils/dateUtils';

export interface RecordPaymentInput {
  memberId: string;
  amount: number;
  paymentDate?: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  durationMonths?: number;
  recordedBy?: string;
}

/**
 * Centralized business domain calculation for computing the next payment renewal date.
 * If currentNextPaymentDate is in the future relative to paymentDate, extend from currentNextPaymentDate;
 * otherwise, extend from paymentDate.
 */
export function computeNextPaymentRenewalDate(
  currentNextPaymentDate: string | undefined,
  paymentDate: string = formatToISODate(new Date()),
  durationMonths: number = 1
): string {
  const safeDuration = Math.max(1, durationMonths || 1);
  const baseDate =
    currentNextPaymentDate && currentNextPaymentDate > paymentDate
      ? currentNextPaymentDate
      : paymentDate;

  return calculateNextPaymentDate(baseDate, safeDuration);
}
