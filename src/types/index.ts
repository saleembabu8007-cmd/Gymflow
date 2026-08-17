/**
 * GymFlow Domain Types and Status Constants
 */

export const PAYMENT_STATUS = {
  PAID: 'PAID',
  DUE_SOON: 'DUE_SOON',
  DUE_TODAY: 'DUE_TODAY',
  OVERDUE: 'OVERDUE',
  EXPIRED: 'EXPIRED',
} as const;

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];

export type PaymentMethod = 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'OTHER';

export type MembershipDuration = '1_MONTH' | '3_MONTHS' | '6_MONTHS' | '12_MONTHS';

export type UserRole = 'PLATFORM_ADMIN' | 'GYM_OWNER' | 'OWNER' | 'ADMIN' | 'STAFF' | 'TRAINER' | 'MANAGER';

export type TenantSubscriptionStatus = 'ACTIVE' | 'PENDING' | 'PAST_DUE' | 'EXPIRED' | 'CANCELLED' | 'SUSPENDED';

export interface PlatformGymTenant {
  id: string;
  name: string;
  ownerName: string;
  ownerEmail: string;
  phone: string;
  address?: string;
  status: TenantSubscriptionStatus;
  memberCount: number;
  subscriptionPlan: string;
  renewalDate: string;
  createdAt: string;
}

export interface PlatformStats {
  totalGyms: number;
  activeGyms: number;
  pendingPayments: number;
  activeSubscriptions: number;
  pastDueSubscriptions: number;
  cancelledSubscriptions: number;
  mrr: number;
  suspendedGyms: number;
  totalMembers: number;
}


export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  gymId: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt?: string;
}

export interface Gym {
  id: string;
  name: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  upiId?: string;
  logoUrl?: string;
  ownerId: string;
  createdAt: string;
  updatedAt?: string;
}

export interface MembershipPlan {
  id: string;
  gymId: string;
  name: string; // e.g. "1 Month Standard", "3 Months Transformation", "Annual Pass"
  durationMonths: number; // 1, 3, 6, 12
  defaultFee: number;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface Membership {
  id: string;
  gymId: string;
  memberId: string;
  planId: string;
  planName: string;
  durationMonths: number;
  feeAmount: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  createdAt: string;
}

export interface Member {
  id: string;
  gymId: string;
  name: string;
  phone: string;
  email?: string;
  planName: string;
  durationMonths: number;
  monthlyFee: number;
  startDate: string; // YYYY-MM-DD
  nextPaymentDate: string; // YYYY-MM-DD
  status: 'ACTIVE' | 'INACTIVE';
  notes?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  
  // Calculated / projection helpers for UI consumption
  calculatedStatus?: PaymentStatus;
  daysDifference?: number;
}

export interface Payment {
  id: string;
  gymId: string;
  memberId: string;
  memberName: string;
  memberPhone: string;
  amount: number;
  paymentDate: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  periodCovered?: string; // e.g. "Aug 2026", "Aug - Oct 2026"
  referenceNumber?: string;
  notes?: string;
  recordedBy?: string;
  createdAt: string;
}

export type ReminderChannel = 'WHATSAPP' | 'SMS' | 'EMAIL' | 'MANUAL';
export type ReminderStatus = 'SENT' | 'FAILED' | 'PENDING';

export interface Reminder {
  id: string;
  gymId: string;
  memberId: string;
  memberName: string;
  memberPhone: string;
  amount: number;
  dueDate: string;
  message: string;
  sentAt: string;
  channel: ReminderChannel;
  status: ReminderStatus;
}

// Alias for backwards compatibility with legacy service files
export type ReminderLog = Reminder;

export * from './database';

export interface GymSettings {
  id: string;
  gymId: string;
  currencySymbol: string; // ₹, $, RM, AED, €, £
  currencyCode: string; // INR, USD, MYR, AED, EUR, GBP
  reminderDaysBeforeDue?: number; // e.g., 3 days
  reminderWindowDays?: number; // alias
  defaultMonthlyFee?: number;
  defaultFee?: number; // alias
  defaultMembershipDuration?: MembershipDuration;
  whatsappTemplate?: string;
  reminderMessageTemplate?: string; // alias
  timezone: string;
  updatedAt?: string;
}
