import { useState, useEffect, useCallback } from 'react';
import { useServices } from '../services/provider';
import { Gym, MembershipPlan } from '../types';
import { DEFAULT_GYM_ID } from '../data/mockData';

export function useGym(gymId: string = DEFAULT_GYM_ID) {
  const { gym: gymService } = useServices();
  const [gym, setGym] = useState<Gym | null>(null);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGymData = useCallback(async () => {
    try {
      setLoading(true);
      const [gymData, plansData] = await Promise.all([
        gymService.getGym(gymId),
        gymService.getPlans(gymId),
      ]);
      if (gymData) setGym(gymData);
      if (plansData) setPlans(plansData);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load gym data');
    } finally {
      setLoading(false);
    }
  }, [gymService, gymId]);

  useEffect(() => {
    fetchGymData();
  }, [fetchGymData]);

  const updateGym = useCallback(
    async (updates: Partial<Gym>) => {
      const updated = await gymService.updateGym(gymId, updates);
      setGym(updated);
      return updated;
    },
    [gymService, gymId]
  );

  const createPlan = useCallback(
    async (planData: Omit<MembershipPlan, 'id' | 'gymId' | 'createdAt'>) => {
      const created = await gymService.createPlan(gymId, planData);
      setPlans((prev) => [...prev, created]);
      return created;
    },
    [gymService, gymId]
  );

  const updatePlan = useCallback(
    async (planId: string, updates: Partial<MembershipPlan>) => {
      const updated = await gymService.updatePlan(planId, updates);
      setPlans((prev) => prev.map((p) => (p.id === planId ? updated : p)));
      return updated;
    },
    [gymService]
  );

  const deletePlan = useCallback(
    async (planId: string) => {
      await gymService.deletePlan(planId);
      setPlans((prev) => prev.filter((p) => p.id !== planId));
    },
    [gymService]
  );

  return {
    gym: gym || {
      id: gymId,
      name: 'GymFlow Club',
      phone: '',
      ownerId: '',
      createdAt: '',
    },
    plans,
    loading,
    error,
    updateGym,
    createPlan,
    updatePlan,
    deletePlan,
    refresh: fetchGymData,
  };
}
