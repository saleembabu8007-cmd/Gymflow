import { useState, useEffect, useCallback, useMemo } from 'react';
import { useServices } from '../services/provider';
import { Member, PAYMENT_STATUS } from '../types';
import { IMemberFilterOptions } from '../services/interfaces';
import { useAuth } from './useAuth';

export function useMembers(overrideGymId?: string) {
  const { user } = useAuth();
  const gymId = overrideGymId || user?.gymId || '';
  const { members: memberService } = useServices();

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<IMemberFilterOptions>({ status: 'ALL', search: '' });

  const filterStatus = filter.status;
  const filterSearch = filter.search;

  const fetchMembers = useCallback(async () => {
    if (!gymId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await memberService.getMembers(gymId, {
        status: filterStatus,
        search: filterSearch,
      });
      setMembers(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load members');
    } finally {
      setLoading(false);
    }
  }, [memberService, gymId, filterStatus, filterSearch]);

  useEffect(() => {
    fetchMembers();

    const handleStorageUpdate = () => {
      fetchMembers();
    };

    window.addEventListener('gymflow_storage_updated', handleStorageUpdate);
    window.addEventListener('storage', handleStorageUpdate);

    return () => {
      window.removeEventListener('gymflow_storage_updated', handleStorageUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, [fetchMembers]);

  const addMember = useCallback(
    async (memberData: Omit<Member, 'id' | 'gymId' | 'createdAt' | 'updatedAt'>) => {
      const created = await memberService.createMember(gymId, memberData);
      setMembers((prev) => [created, ...prev]);
      return created;
    },
    [memberService, gymId]
  );

  const updateMember = useCallback(
    async (id: string, updates: Partial<Member>) => {
      const updated = await memberService.updateMember(id, updates);
      setMembers((prev) => prev.map((m) => (m.id === id ? updated : m)));
      return updated;
    },
    [memberService]
  );

  const deleteMember = useCallback(
    async (id: string) => {
      await memberService.deleteMember(id);
      setMembers((prev) => prev.filter((m) => m.id !== id));
    },
    [memberService]
  );

  const markAsPaid = useCallback(
    async (
      memberId: string,
      paymentDetails: {
        amount: number;
        method: any;
        notes?: string;
        durationMonths?: number;
        recordedBy?: string;
      }
    ) => {
      const result = await memberService.markAsPaid(memberId, paymentDetails);
      setMembers((prev) => prev.map((m) => (m.id === memberId ? result.member : m)));
      return result;
    },
    [memberService]
  );

  // Categorized helpers
  const overdueMembers = useMemo(
    () => members.filter((m) => m.calculatedStatus === PAYMENT_STATUS.OVERDUE),
    [members]
  );

  const dueTodayMembers = useMemo(
    () => members.filter((m) => m.calculatedStatus === PAYMENT_STATUS.DUE_TODAY),
    [members]
  );

  const dueSoonMembers = useMemo(
    () => members.filter((m) => m.calculatedStatus === PAYMENT_STATUS.DUE_SOON),
    [members]
  );

  const paidMembers = useMemo(
    () => members.filter((m) => m.calculatedStatus === PAYMENT_STATUS.PAID),
    [members]
  );

  const totalPendingAmount = useMemo(() => {
    return [...overdueMembers, ...dueTodayMembers, ...dueSoonMembers].reduce(
      (sum, m) => sum + m.monthlyFee,
      0
    );
  }, [overdueMembers, dueTodayMembers, dueSoonMembers]);

  return {
    members,
    loading,
    error,
    filter,
    setFilter,
    addMember,
    updateMember,
    deleteMember,
    markAsPaid,
    refresh: fetchMembers,
    fetchMembers,
    overdueMembers,
    dueTodayMembers,
    dueSoonMembers,
    paidMembers,
    totalPendingAmount,
  };
}
