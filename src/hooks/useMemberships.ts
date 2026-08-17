import { useState, useEffect, useCallback } from 'react';
import { useServices } from '../services/provider';
import { MembershipPlan, Membership } from '../types';
import { IMembershipFilterOptions } from '../services/interfaces';
import { DEFAULT_GYM_ID } from '../data/mockData';

export function useMemberships(gymId: string = DEFAULT_GYM_ID) {
  const { memberships: membershipService } = useServices();
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembershipsData = useCallback(
    async (filter?: IMembershipFilterOptions) => {
      try {
        setLoading(true);
        const [plansData, membershipsData] = await Promise.all([
          membershipService.getPlans(gymId),
          membershipService.getMemberships(gymId, filter),
        ]);
        setPlans(plansData);
        setMemberships(membershipsData);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load membership data');
      } finally {
        setLoading(false);
      }
    },
    [membershipService, gymId]
  );

  useEffect(() => {
    fetchMembershipsData();

    const handleStorageUpdate = () => {
      fetchMembershipsData();
    };

    window.addEventListener('gymflow_storage_updated', handleStorageUpdate);
    window.addEventListener('storage', handleStorageUpdate);

    return () => {
      window.removeEventListener('gymflow_storage_updated', handleStorageUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, [fetchMembershipsData]);

  const createPlan = useCallback(
    async (planData: Omit<MembershipPlan, 'id' | 'gymId' | 'createdAt'>) => {
      const created = await membershipService.createPlan(gymId, planData);
      setPlans((prev) => [...prev, created]);
      return created;
    },
    [membershipService, gymId]
  );

  const updatePlan = useCallback(
    async (planId: string, updates: Partial<MembershipPlan>) => {
      const updated = await membershipService.updatePlan(planId, updates);
      setPlans((prev) => prev.map((p) => (p.id === planId ? updated : p)));
      return updated;
    },
    [membershipService]
  );

  const deletePlan = useCallback(
    async (planId: string) => {
      await membershipService.deletePlan(planId);
      setPlans((prev) => prev.filter((p) => p.id !== planId));
    },
    [membershipService]
  );

  const createMembership = useCallback(
    async (memberId: string, planId: string, details?: Partial<Membership>) => {
      const created = await membershipService.createMembership(gymId, memberId, planId, details);
      setMemberships((prev) => [created, ...prev]);
      return created;
    },
    [membershipService, gymId]
  );

  const renewMembership = useCallback(
    async (membershipId: string, extensionMonths?: number) => {
      const renewed = await membershipService.renewMembership(membershipId, extensionMonths);
      setMemberships((prev) => prev.map((m) => (m.id === membershipId ? renewed : m)));
      return renewed;
    },
    [membershipService]
  );

  const cancelMembership = useCallback(
    async (membershipId: string) => {
      const cancelled = await membershipService.cancelMembership(membershipId);
      setMemberships((prev) => prev.map((m) => (m.id === membershipId ? cancelled : m)));
      return cancelled;
    },
    [membershipService]
  );

  const getMemberMemberships = useCallback(
    async (memberId: string) => {
      return membershipService.getMemberMemberships(memberId);
    },
    [membershipService]
  );

  const getActiveMembership = useCallback(
    async (memberId: string) => {
      return membershipService.getActiveMembership(memberId);
    },
    [membershipService]
  );

  return {
    plans,
    memberships,
    loading,
    error,
    createPlan,
    updatePlan,
    deletePlan,
    createMembership,
    renewMembership,
    cancelMembership,
    getMemberMemberships,
    getActiveMembership,
    refresh: fetchMembershipsData,
  };
}
