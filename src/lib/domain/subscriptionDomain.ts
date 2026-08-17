import { TenantSubscriptionStatus } from '../../types';
import { env } from '../../config/env';

/**
 * Domain Logic: SaaS Tenant Subscription Status & Entitlement Access Rules
 */

export const BILLING_CONFIG = {
  isBillingEnabled: env.ENABLE_SAAS_BILLING,
  accessModeText: env.ENABLE_SAAS_BILLING ? 'Subscribed' : 'Controlled Access',
};

export function calculateTenantSubscriptionStatus(
  currentPeriodEndStr: string,
  isSuspended: boolean = false
): TenantSubscriptionStatus {
  if (isSuspended) return 'SUSPENDED';

  const end = new Date(currentPeriodEndStr);
  const now = new Date();

  if (isNaN(end.getTime())) return 'ACTIVE';

  if (end < now) {
    return 'PAST_DUE';
  }

  return 'ACTIVE';
}

export function isTenantActive(status: TenantSubscriptionStatus): boolean {
  return status === 'ACTIVE';
}

/**
 * Centralized Entitlement Access Rules:
 * - When SaaS Billing is disabled (current internal/staging mode):
 *   Authenticated gym owners have full controlled access unless explicitly SUSPENDED by Platform Admin.
 * - When SaaS Billing is enabled:
 *   Requires ACTIVE, PENDING, PAST_DUE, or CANCELLED status.
 */
export function canAccessApp(status: TenantSubscriptionStatus): boolean {
  if (!BILLING_CONFIG.isBillingEnabled) {
    return status !== 'SUSPENDED';
  }
  return status === 'ACTIVE' || status === 'PENDING' || status === 'PAST_DUE' || status === 'CANCELLED';
}

export function shouldShowRenewalScreen(status: TenantSubscriptionStatus): boolean {
  if (!BILLING_CONFIG.isBillingEnabled) {
    return status === 'SUSPENDED';
  }
  return status === 'EXPIRED' || status === 'SUSPENDED';
}

export function shouldShowPastDueBanner(status: TenantSubscriptionStatus): boolean {
  if (!BILLING_CONFIG.isBillingEnabled) {
    return false;
  }
  return status === 'PAST_DUE';
}

export function getSingleSaaSPlanDetails() {
  return {
    code: 'GYMFLOW_PRO_SINGLE',
    name: 'GymFlow Pro',
    priceMonthlyINR: 1999,
    priceMonthlyUSD: 29,
    features: [
      'Unlimited Members',
      'WhatsApp Payment Reminders',
      'Payment Ledger & Receipts',
      'UPI QR Integration',
      'Multi-Device Mobile Access',
      'PostgreSQL RLS Tenant Isolation',
    ],
  };
}
