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
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isStale, setIsStale] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<number>(0);
  const [filter, setFilter] = useState<IMemberFilterOptions>({ status: 'ALL', search: '' });

  const filterStatus = filter.status;
  const filterSearch = filter.search;

  const fetchMembers = useCallback(async (isBackground = false) => {
    if (!gymId) {
      setLoading(false);
      setIsRefreshing(false);
      return;
    }
    try {
      if (!isBackground) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }
      const [allData, filteredData] = await Promise.all([
        memberService.getMembers(gymId),
        memberService.getMembers(gymId, {
          status: filterStatus,
          search: filterSearch,
        })
      ]);
      setAllMembers(allData);
      setMembers(filteredData);
      setError(null);
      setIsStale(false);
      setLastFetchedAt(Date.now());
    } catch (err: any) {
      const msg = err.message || 'Failed to load members';
      setError(msg);
      // Retain previously loaded members if available and set stale indicator
      setMembers((prev) => {
        if (prev.length > 0) {
          setIsStale(true);
          return prev;
        }
        return [];
      });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [memberService, gymId, filterStatus, filterSearch]);

  useEffect(() => {
    fetchMembers();

    const handleStorageUpdate = () => {
      fetchMembers(true);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && gymId) {
        setLastFetchedAt((prevLast) => {
          if (prevLast > 0 && Date.now() - prevLast > 2 * 60 * 1000) {
            fetchMembers(true);
          }
          return prevLast;
        });
      }
    };

    window.addEventListener('gymflow_storage_updated', handleStorageUpdate);
    window.addEventListener('storage', handleStorageUpdate);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('gymflow_storage_updated', handleStorageUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchMembers, gymId]);

  const addMember = useCallback(
    async (memberData: Omit<Member, 'id' | 'gymId' | 'createdAt' | 'updatedAt'>) => {
      const created = await memberService.createMember(gymId, memberData);
      setMembers((prev) => [created, ...prev]);
      window.dispatchEvent(new Event('gymflow_storage_updated'));
      return created;
    },
    [memberService, gymId]
  );

  const updateMember = useCallback(
    async (id: string, updates: Partial<Member>) => {
      const updated = await memberService.updateMember(id, updates);
      setMembers((prev) => prev.map((m) => (m.id === id ? updated : m)));
      window.dispatchEvent(new Event('gymflow_storage_updated'));
      return updated;
    },
    [memberService]
  );

  const deleteMember = useCallback(
    async (id: string) => {
      await memberService.deleteMember(id);
      setMembers((prev) => prev.filter((m) => m.id !== id));
      window.dispatchEvent(new Event('gymflow_storage_updated'));
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
      window.dispatchEvent(new Event('gymflow_storage_updated'));
      window.dispatchEvent(new CustomEvent('gymflow_payment_success', { detail: { memberId } }));
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

  const counts = useMemo(() => {
    return {
      ALL: allMembers.length,
      ACTIVE: allMembers.filter(m => m.status === 'ACTIVE').length,
      PENDING: allMembers.filter(m => m.calculatedStatus === PAYMENT_STATUS.OVERDUE || m.calculatedStatus === PAYMENT_STATUS.DUE_TODAY).length,
      DUE_SOON: allMembers.filter(m => m.calculatedStatus === PAYMENT_STATUS.DUE_SOON).length,
      EXPIRED: allMembers.filter(m => m.status === 'INACTIVE' || m.calculatedStatus === PAYMENT_STATUS.EXPIRED).length,
    };
  }, [allMembers]);

  return {
    members,
    loading,
    isRefreshing,
    isStale,
    lastFetchedAt,
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
    counts,
  };
}
