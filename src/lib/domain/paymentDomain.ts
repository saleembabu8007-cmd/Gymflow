import { Member, Payment, PaymentMethod } from '../../types';
import { calculateNextPaymentDate, formatToISODate } from '../../utils/dateUtils';
import { generateUUID } from '../../utils/uuid';
import { DEFAULT_GYM_ID } from '../../data/mockData';

export interface RecordPaymentInput {
  memberId: string;
  amount: number;
  paymentDate?: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  durationMonths?: number;
  recordedBy?: string;
}

export interface RecordPaymentResult {
  member: Member;
  payment: Payment;
}

/**
 * Centralized business domain calculation for computing the next payment renewal date.
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

/**
 * Centralized domain function for recording a member payment.
 */
export async function recordMemberPayment(
  input: RecordPaymentInput,
  gymId: string = DEFAULT_GYM_ID
): Promise<RecordPaymentResult> {
  const paymentDate = input.paymentDate || formatToISODate(new Date());

  let members: Member[] = [];
  try {
    const savedMembers = localStorage.getItem('gymflow_members_data');
    if (savedMembers) {
      members = JSON.parse(savedMembers);
    }
  } catch (err) {
    console.error('Failed to read members from storage', err);
  }

  const memberIndex = members.findIndex((m) => m.id === input.memberId);
  if (memberIndex === -1) {
    throw new Error('Member not found');
  }

  const currentMember = members[memberIndex];
  const duration = input.durationMonths || currentMember.durationMonths || 1;

  const nextPaymentDate = computeNextPaymentRenewalDate(
    currentMember.nextPaymentDate,
    paymentDate,
    duration
  );

  const updatedMember: Member = {
    ...currentMember,
    nextPaymentDate,
    status: 'ACTIVE',
    updatedAt: new Date().toISOString(),
  };
  members[memberIndex] = updatedMember;

  try {
    localStorage.setItem('gymflow_members_data', JSON.stringify(members));
  } catch (err) {
    console.error('Failed to save updated member', err);
  }

  const payment: Payment = {
    id: generateUUID(),
    gymId: currentMember.gymId || gymId,
    memberId: currentMember.id,
    memberName: currentMember.name,
    memberPhone: currentMember.phone,
    amount: input.amount,
    paymentDate,
    paymentMethod: input.paymentMethod,
    periodCovered: `${duration} ${duration === 1 ? 'Month' : 'Months'} Extension`,
    notes: input.notes?.trim() || undefined,
    recordedBy: input.recordedBy || 'Gym Owner',
    createdAt: new Date().toISOString(),
  };

  try {
    let payments: Payment[] = [];
    const savedPayments = localStorage.getItem('gymflow_payments_data');
    if (savedPayments) {
      payments = JSON.parse(savedPayments);
    }
    payments.unshift(payment);
    localStorage.setItem('gymflow_payments_data', JSON.stringify(payments));
  } catch (err) {
    console.error('Failed to save payment record', err);
  }

  try {
    window.dispatchEvent(new Event('gymflow_storage_updated'));
  } catch {}

  return {
    member: updatedMember,
    payment,
  };
}
