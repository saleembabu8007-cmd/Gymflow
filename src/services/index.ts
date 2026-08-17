import { IServiceContainer } from './interfaces';
import { MockAuthService } from './mock/mockAuthService';
import { MockGymService } from './mock/mockGymService';
import { MockMemberService } from './mock/mockMemberService';
import { MockMembershipService } from './mock/mockMembershipService';
import { MockPaymentService } from './mock/mockPaymentService';
import { MockReminderService } from './mock/mockReminderService';
import { MockSettingsService } from './mock/mockSettingsService';
import { MockAdminService } from './mock/mockAdminService';
import { subscriptionService } from './subscriptionService';
import { auditService } from './auditService';
import { isSupabaseConfigured } from './supabaseClient';
import { SupabaseContainer } from './supabaseService';
import { env } from '../config/env';

export * from './interfaces';
export * from './provider';

// Direct service singleton facades
export { authService } from './authService';
export { gymService } from './gymService';
export { memberService } from './memberService';
export { membershipService } from './membershipService';
export { paymentService } from './paymentService';
export { reminderService } from './reminderService';
export { subscriptionService } from './subscriptionService';
export { adminService } from './adminService';
export { settingsService } from './settingsService';
export { auditService } from './auditService';

/**
 * Creates and initializes the service container.
 * Dynamically switches to SupabaseContainer when client environment is configured.
 */
export function createServiceContainer(): IServiceContainer {
  if (isSupabaseConfigured) {
    return SupabaseContainer;
  }

  // Prevent silent fallback to mock data in production environment
  if (env.IS_PRODUCTION) {
    throw new Error(
      'CRITICAL CONFIGURATION ERROR: Production build requires VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY environment variables.'
    );
  }

  return {
    auth: new MockAuthService(),
    gym: new MockGymService(),
    members: new MockMemberService(),
    memberships: new MockMembershipService(),
    payments: new MockPaymentService(),
    reminders: new MockReminderService(),
    settings: new MockSettingsService(),
    subscription: subscriptionService,
    admin: new MockAdminService(),
    audit: auditService,
  };
}

// Singleton instance for app lifetime
export const defaultServices = createServiceContainer();
