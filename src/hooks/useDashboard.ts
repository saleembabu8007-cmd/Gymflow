import { useState, useEffect, useCallback } from 'react';
import { useServices } from '../services/provider';
import { Member, Payment } from '../types';
import { DashboardSummary } from '../services/interfaces';

export function useDashboard(gymId?: string) {
  const { payments: paymentSvc, members: memberSvc } = useServices();

  const [summary, setSummary] = useState<DashboardSummary>({
    pendingCount: 0,
    dueSoonCount: 0,
    collectedThisMonth: 0,
    activeMembersCount: 0,
  });
  const [attentionList, setAttentionList] = useState<Member[]>([]);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isStale, setIsStale] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<number>(0);

  const fetchDashboardData = useCallback(async (isBackground = false) => {
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
      setError(null);

      const [summaryRes, attentionRes, paymentsRes] = await Promise.all([
        paymentSvc.getDashboardSummary(gymId),
        memberSvc.getAttentionList(gymId, 50),
        paymentSvc.getPayments(gymId),
      ]);

      setSummary(summaryRes);
      setAttentionList(attentionRes);
      setRecentPayments(paymentsRes.slice(0, 5));
      setIsStale(false);
      setLastFetchedAt(Date.now());
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      const msg = err.message || "Failed to load today's collection dashboard";
      setError(msg);
      // Retain existing summary and list if available
      setSummary((prev) => {
        if (prev.activeMembersCount > 0 || prev.pendingCount > 0) {
          setIsStale(true);
        }
        return prev;
      });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [gymId, paymentSvc, memberSvc]);

  useEffect(() => {
    fetchDashboardData();

    const handleStorageUpdate = () => {
      fetchDashboardData(true);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && gymId) {
        setLastFetchedAt((prevLast) => {
          if (prevLast > 0 && Date.now() - prevLast > 2 * 60 * 1000) {
            fetchDashboardData(true);
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
  }, [fetchDashboardData, gymId]);

  const hasNoMembers = !loading && summary.activeMembersCount === 0 && attentionList.length === 0;

  return {
    summary,
    attentionList,
    recentPayments,
    hasNoMembers,
    loading,
    isRefreshing,
    isStale,
    lastFetchedAt,
    error,
    refetch: fetchDashboardData,
  };
}

