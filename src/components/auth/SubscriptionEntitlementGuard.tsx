import React from 'react';

interface SubscriptionEntitlementGuardProps {
  gymId?: string;
  isPlatformAdmin?: boolean;
  onNavigateToSubscription?: () => void;
  children: React.ReactNode;
}

/**
 * SubscriptionEntitlementGuard
 * Unreleased GymFlow SaaS billing UI is hidden in V1/V2 workflow.
 * Always grants full access to gym owners without blocking, warning, or upselling.
 */
export const SubscriptionEntitlementGuard: React.FC<SubscriptionEntitlementGuardProps> = ({ children }) => {
  return <>{children}</>;
};
