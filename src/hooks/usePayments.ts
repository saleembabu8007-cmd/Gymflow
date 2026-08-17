import { useState, useEffect, useCallback } from 'react';
import { useServices } from '../services/provider';
import { Payment } from '../types';
import { IPaymentFilterOptions } from '../services/interfaces';
import { DEFAULT_GYM_ID } from '../data/mockData';

export function usePayments(gymId: string = DEFAULT_GYM_ID) {
  const { payments: paymentService } = useServices();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<{ totalCollected: number; transactionCount: number }>({
    totalCollected: 0,
    transactionCount: 0,
  });
  const [filter, setFilter] = useState<IPaymentFilterOptions>({});

  const filterMethod = filter.paymentMethod;
  const filterSearch = filter.search;
  const filterStart = filter.startDate;
  const filterEnd = filter.endDate;

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const [list, sum] = await Promise.all([
        paymentService.getPayments(gymId, {
          paymentMethod: filterMethod,
          search: filterSearch,
          startDate: filterStart,
          endDate: filterEnd,
        }),
        paymentService.getMonthlySummary(gymId),
      ]);
      setPayments(list);
      setSummary(sum);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, [paymentService, gymId, filterMethod, filterSearch, filterStart, filterEnd]);

  useEffect(() => {
    fetchPayments();

    const handleStorageUpdate = () => {
      fetchPayments();
    };

    window.addEventListener('gymflow_storage_updated', handleStorageUpdate);
    window.addEventListener('storage', handleStorageUpdate);

    return () => {
      window.removeEventListener('gymflow_storage_updated', handleStorageUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, [fetchPayments]);

  const recordPayment = useCallback(
    async (paymentData: Omit<Payment, 'id' | 'createdAt'>) => {
      const created = await paymentService.recordPayment(paymentData);
      setPayments((prev) => [created, ...prev]);
      const updatedSummary = await paymentService.getMonthlySummary(gymId);
      setSummary(updatedSummary);
      return created;
    },
    [paymentService, gymId]
  );

  const deletePayment = useCallback(
    async (id: string) => {
      await paymentService.deletePayment(id);
      setPayments((prev) => prev.filter((p) => p.id !== id));
      const updatedSummary = await paymentService.getMonthlySummary(gymId);
      setSummary(updatedSummary);
    },
    [paymentService, gymId]
  );

  return {
    payments,
    summary,
    loading,
    error,
    filter,
    setFilter,
    recordPayment,
    deletePayment,
    refresh: fetchPayments,
    fetchPayments,
  };
}
