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
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    if (!gymId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [summaryRes, attentionRes, paymentsRes] = await Promise.all([
        paymentSvc.getDashboardSummary(gymId),
        memberSvc.getAttentionList(gymId, 50),
        paymentSvc.getPayments(gymId),
      ]);

      setSummary(summaryRes);
      setAttentionList(attentionRes);
      setRecentPayments(paymentsRes.slice(0, 5));
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      setError(err.message || "Failed to load today's collection dashboard");
    } finally {
      setLoading(false);
    }
  }, [gymId, paymentSvc, memberSvc]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const hasNoMembers = !loading && summary.activeMembersCount === 0;

  return {
    summary,
    attentionList,
    recentPayments,
    hasNoMembers,
    loading,
    error,
    refetch: fetchDashboardData,
  };
}

