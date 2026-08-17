import { useState, useEffect, useCallback } from 'react';
import { useServices } from '../services/provider';
import { SubscriptionDetails, SubscriptionPlanConfig } from '../services/interfaces';
import { TenantSubscriptionStatus } from '../types';

export function useSubscription(gymId?: string) {
  const { subscription: subscriptionSvc } = useServices();

  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(null);
  const [plan, setPlan] = useState<SubscriptionPlanConfig | null>(null);
  const [status, setStatus] = useState<TenantSubscriptionStatus>('ACTIVE');
  const [canAccess, setCanAccess] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = useCallback(async () => {
    if (!gymId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const [subDetails, planConfig, accessAllowed] = await Promise.all([
        subscriptionSvc.getCurrentSubscription(gymId),
        subscriptionSvc.getCurrentPlan(),
        subscriptionSvc.canAccessApp(gymId),
      ]);

      setSubscription(subDetails);
      setPlan(planConfig);
      setStatus(subDetails.status);
      setCanAccess(accessAllowed);
    } catch (err) {
      console.error('Failed to load subscription:', err);
    } finally {
      setLoading(false);
    }
  }, [gymId, subscriptionSvc]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  return {
    subscription,
    plan,
    status,
    canAccess,
    loading,
    refresh: fetchSubscription,
  };
}
