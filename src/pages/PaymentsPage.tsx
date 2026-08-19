import React, { useState, useMemo, useCallback } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { SearchInput } from '../components/ui/SearchInput';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { StaleDataNotification } from '../components/common/StaleDataNotification';
import { Avatar } from '../components/ui/Avatar';
import { Member, Payment, PaymentMethod } from '../types';
import { useMembers } from '../hooks/useMembers';
import { usePayments } from '../hooks/usePayments';
import { useGymSettings } from '../hooks/useGymSettings';
import { formatCurrency } from '../utils/currencyUtils';
import { formatDate, getDifferenceInDays } from '../utils/dateUtils';
import {
  CreditCard,
  MessageSquare,
  Clock,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Phone,
  ArrowDownRight,
  Filter,
  Check,
  ChevronRight,
  User,
  ChevronLeft,
  Download,
} from 'lucide-react';
import { cn } from '../utils/classNames';

type TabType = 'pending' | 'upcoming' | 'paid';

interface PaymentsPageProps {
  onQuickPay?: (member: Member) => void;
  onSendReminder?: (member: Member) => void;
  onSelectMember?: (member: Member) => void;
  onRecordPayment?: () => void;
  onSelectMemberById?: (memberId: string) => void;
}

const PAID_PAGE_SIZE = 25;

export const PaymentsPage: React.FC<PaymentsPageProps> = ({
  onQuickPay,
  onSendReminder,
  onSelectMember,
  onRecordPayment,
  onSelectMemberById,
}) => {
  const { members, loading: loadingMembers, isRefreshing, isStale, error: membersError, fetchMembers } = useMembers();
  const { payments, loading: loadingPayments, error: paymentsError, fetchPayments } = usePayments();
  const { currencySymbol } = useGymSettings();

  // Primary Tabs: Pending (Default), Upcoming, Paid
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [paidPage, setPaidPage] = useState<number>(1);

  // Minimal sub-filters
  const [pendingFilter, setPendingFilter] = useState<'ALL' | 'OVERDUE' | 'TODAY'>('ALL');
  const [upcomingFilter, setUpcomingFilter] = useState<'ALL' | '7_DAYS' | '14_DAYS' | '30_DAYS'>('ALL');
  const [paidMethodFilter, setPaidMethodFilter] = useState<string>('ALL');

  // 1. Compute Pending list (Overdue + Due today, sorted most urgent first)
  const pendingMembers = useMemo(() => {
    return members
      .filter((m) => {
        if (m.status !== 'ACTIVE') return false;
        const diff = getDifferenceInDays(m.nextPaymentDate);
        return diff <= 0;
      })
      .sort((a, b) => {
        // Most urgent first: e.g. -15 days before -2 days, then 0 days
        const diffA = getDifferenceInDays(a.nextPaymentDate);
        const diffB = getDifferenceInDays(b.nextPaymentDate);
        return diffA - diffB;
      });
  }, [members]);

  // 2. Compute Upcoming list (Future dues, sorted closest first)
  const upcomingMembers = useMemo(() => {
    return members
      .filter((m) => {
        if (m.status !== 'ACTIVE') return false;
        const diff = getDifferenceInDays(m.nextPaymentDate);
        return diff > 0;
      })
      .sort((a, b) => {
        // Closest due date first: 1 day, 2 days, 5 days, etc.
        const diffA = getDifferenceInDays(a.nextPaymentDate);
        const diffB = getDifferenceInDays(b.nextPaymentDate);
        return diffA - diffB;
      });
  }, [members]);

  // 3. Filter Pending List by search & sub-filter
  const filteredPending = useMemo(() => {
    return pendingMembers.filter((m) => {
      const diff = getDifferenceInDays(m.nextPaymentDate);

      // Sub-filter
      if (pendingFilter === 'OVERDUE' && diff >= 0) return false;
      if (pendingFilter === 'TODAY' && diff !== 0) return false;

      // Search by name or phone
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = (m.name || '').toLowerCase().includes(query);
        const matchesPhone = (m.phone || '').includes(query);
        return matchesName || matchesPhone;
      }
      return true;
    });
  }, [pendingMembers, pendingFilter, searchQuery]);

  // 4. Filter Upcoming List by search & sub-filter
  const filteredUpcoming = useMemo(() => {
    return upcomingMembers.filter((m) => {
      const diff = getDifferenceInDays(m.nextPaymentDate);

      // Sub-filter
      if (upcomingFilter === '7_DAYS' && diff > 7) return false;
      if (upcomingFilter === '14_DAYS' && diff > 14) return false;
      if (upcomingFilter === '30_DAYS' && diff > 30) return false;

      // Search by name or phone
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = (m.name || '').toLowerCase().includes(query);
        const matchesPhone = (m.phone || '').includes(query);
        return matchesName || matchesPhone;
      }
      return true;
    });
  }, [upcomingMembers, upcomingFilter, searchQuery]);

  // 5. Filter Paid List by search & method filter
  const filteredPaid = useMemo(() => {
    return payments.filter((p) => {
      // Sub-filter by method
      if (paidMethodFilter !== 'ALL' && p.paymentMethod !== paidMethodFilter) return false;

      // Search by member name, phone or notes
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = (p.memberName || '').toLowerCase().includes(query);
        const matchesPhone = (p.memberPhone || '').includes(query);
        const matchesNotes = (p.notes || '').toLowerCase().includes(query);
        return matchesName || matchesPhone || matchesNotes;
      }
      return true;
    });
  }, [payments, paidMethodFilter, searchQuery]);

  const totalPaidCount = filteredPaid.length;
  const totalPaidPages = Math.ceil(totalPaidCount / PAID_PAGE_SIZE) || 1;
  const paginatedPaid = useMemo(() => {
    const start = (paidPage - 1) * PAID_PAGE_SIZE;
    return filteredPaid.slice(start, start + PAID_PAGE_SIZE);
  }, [filteredPaid, paidPage]);

  const handleMemberClick = (member: Member) => {
    if (onSelectMember) {
      onSelectMember(member);
    } else if (onSelectMemberById) {
      onSelectMemberById(member.id);
    }
  };

  const handlePaidRecordClick = (payment: Payment) => {
    if (payment.memberId && onSelectMemberById) {
      onSelectMemberById(payment.memberId);
    }
  };

  if ((membersError && members.length === 0) || (paymentsError && payments.length === 0)) {
    return (
      <div className="max-w-2xl mx-auto py-10">
        <ErrorState
          title="Couldn't load payments"
          message="We couldn't retrieve your payment records. Please check your connection and try again."
          onRetry={() => {
            fetchMembers();
            fetchPayments();
          }}
          retryLabel="Try again"
        />
      </div>
    );
  }

  const handleExportCSV = () => {
    if (!payments || payments.length === 0) return;

    const headers = [
      'Payment ID',
      'Date',
      'Member Name',
      'Phone',
      'Amount',
      'Method',
      'Period Covered',
      'Notes',
      'Recorded By',
    ];

    const rows = payments.map((p) => [
      `"${p.id}"`,
      `"${p.paymentDate}"`,
      `"${(p.memberName || '').replace(/"/g, '""')}"`,
      `"${(p.memberPhone || '').replace(/"/g, '""')}"`,
      p.amount,
      `"${p.paymentMethod}"`,
      `"${(p.periodCovered || '').replace(/"/g, '""')}"`,
      `"${(p.notes || '').replace(/"/g, '""')}"`,
      `"${(p.recordedBy || 'Gym Owner').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `gymflow_payments_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      <StaleDataNotification
        isStale={isStale}
        onRetry={() => {
          fetchMembers(true);
          fetchPayments();
        }}
        isRefreshing={isRefreshing}
      />

      {/* Page Header */}
      <PageHeader
        title="Payments"
        subtitle="Track pending dues, upcoming renewals, and recorded payments"
        actions={
          <div className="flex items-center gap-2">
            {payments.length > 0 && (
              <Button
                id="btn-payments-export-csv"
                variant="outline"
                size="md"
                onClick={handleExportCSV}
                leftIcon={<Download className="w-4 h-4 text-neutral-600" />}
              >
                Export CSV
              </Button>
            )}
            {onRecordPayment && (
              <Button
                id="btn-payments-record-payment"
                size="md"
                onClick={onRecordPayment}
                className="bg-neutral-900 text-white hover:bg-neutral-800 font-semibold shadow-2xs"
                leftIcon={<CreditCard className="w-4 h-4" />}
              >
                Record Payment
              </Button>
            )}
          </div>
        }
      />

      {/* Primary Tab Navigation & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
        {/* Primary Tabs: Pending, Upcoming, Paid */}
        <div className="flex items-center p-1 bg-neutral-100/90 rounded-2xl w-full sm:w-auto border border-neutral-200/70">
          <button
            type="button"
            id="tab-payments-pending"
            onClick={() => setActiveTab('pending')}
            className={cn(
              'flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer',
              activeTab === 'pending'
                ? 'bg-white text-neutral-950 shadow-2xs'
                : 'text-neutral-600 hover:text-neutral-950 hover:bg-white/50'
            )}
          >
            <span>Pending</span>
            <span
              className={cn(
                'px-1.5 py-0.5 rounded-full text-[11px] font-bold font-mono',
                activeTab === 'pending'
                  ? pendingMembers.length > 0
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-neutral-200 text-neutral-800'
                  : 'bg-neutral-200/80 text-neutral-600'
              )}
            >
              {pendingMembers.length}
            </span>
          </button>

          <button
            type="button"
            id="tab-payments-upcoming"
            onClick={() => setActiveTab('upcoming')}
            className={cn(
              'flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer',
              activeTab === 'upcoming'
                ? 'bg-white text-neutral-950 shadow-2xs'
                : 'text-neutral-600 hover:text-neutral-950 hover:bg-white/50'
            )}
          >
            <span>Upcoming</span>
            <span
              className={cn(
                'px-1.5 py-0.5 rounded-full text-[11px] font-bold font-mono',
                activeTab === 'upcoming'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-neutral-200/80 text-neutral-600'
              )}
            >
              {upcomingMembers.length}
            </span>
          </button>

          <button
            type="button"
            id="tab-payments-paid"
            onClick={() => setActiveTab('paid')}
            className={cn(
              'flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer',
              activeTab === 'paid'
                ? 'bg-white text-neutral-950 shadow-2xs'
                : 'text-neutral-600 hover:text-neutral-950 hover:bg-white/50'
            )}
          >
            <span>Paid</span>
            <span
              className={cn(
                'px-1.5 py-0.5 rounded-full text-[11px] font-bold font-mono',
                activeTab === 'paid'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-neutral-200/80 text-neutral-600'
              )}
            >
              {payments.length}
            </span>
          </button>
        </div>

        {/* Global Search across active tab */}
        <div className="w-full md:w-72">
          <SearchInput
            placeholder="Search by name or phone..."
            onSearchChange={setSearchQuery}
          />
        </div>
      </div>

      {/* Minimal Sub-filters based on Active Tab */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        {activeTab === 'pending' && (
          <>
            <button
              type="button"
              id="filter-pending-all"
              onClick={() => setPendingFilter('ALL')}
              className={cn(
                'px-3 py-1.5 rounded-xl font-medium transition-colors whitespace-nowrap cursor-pointer',
                pendingFilter === 'ALL'
                  ? 'bg-neutral-900 text-white font-semibold shadow-2xs'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
              )}
            >
              All Pending ({pendingMembers.length})
            </button>
            <button
              type="button"
              id="filter-pending-overdue"
              onClick={() => setPendingFilter('OVERDUE')}
              className={cn(
                'px-3 py-1.5 rounded-xl font-medium transition-colors whitespace-nowrap cursor-pointer',
                pendingFilter === 'OVERDUE'
                  ? 'bg-rose-600 text-white font-semibold shadow-2xs'
                  : 'bg-white border border-neutral-200 text-rose-700 hover:bg-rose-50'
              )}
            >
              Overdue Only ({pendingMembers.filter((m) => getDifferenceInDays(m.nextPaymentDate) < 0).length})
            </button>
            <button
              type="button"
              id="filter-pending-today"
              onClick={() => setPendingFilter('TODAY')}
              className={cn(
                'px-3 py-1.5 rounded-xl font-medium transition-colors whitespace-nowrap cursor-pointer',
                pendingFilter === 'TODAY'
                  ? 'bg-amber-500 text-neutral-950 font-semibold shadow-2xs'
                  : 'bg-white border border-neutral-200 text-amber-800 hover:bg-amber-50'
              )}
            >
              Due Today ({pendingMembers.filter((m) => getDifferenceInDays(m.nextPaymentDate) === 0).length})
            </button>
          </>
        )}

        {activeTab === 'upcoming' && (
          <>
            {[
              { id: 'ALL', label: `All Upcoming (${upcomingMembers.length})` },
              {
                id: '7_DAYS',
                label: `Next 7 Days (${upcomingMembers.filter((m) => getDifferenceInDays(m.nextPaymentDate) <= 7).length})`,
              },
              {
                id: '14_DAYS',
                label: `Next 14 Days (${upcomingMembers.filter((m) => getDifferenceInDays(m.nextPaymentDate) <= 14).length})`,
              },
              {
                id: '30_DAYS',
                label: `Next 30 Days (${upcomingMembers.filter((m) => getDifferenceInDays(m.nextPaymentDate) <= 30).length})`,
              },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                id={`filter-upcoming-${f.id.toLowerCase()}`}
                onClick={() => setUpcomingFilter(f.id as any)}
                className={cn(
                  'px-3 py-1.5 rounded-xl font-medium transition-colors whitespace-nowrap cursor-pointer',
                  upcomingFilter === f.id
                    ? 'bg-neutral-900 text-white font-semibold shadow-2xs'
                    : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                )}
              >
                {f.label}
              </button>
            ))}
          </>
        )}

        {activeTab === 'paid' && (
          <>
            {[
              { id: 'ALL', label: 'All Methods' },
              { id: 'UPI', label: 'UPI' },
              { id: 'CASH', label: 'Cash' },
              { id: 'BANK_TRANSFER', label: 'Bank Transfer' },
              { id: 'OTHER', label: 'Other' },
            ].map((method) => (
              <button
                key={method.id}
                type="button"
                id={`filter-paid-${method.id.toLowerCase()}`}
                onClick={() => {
                  setPaidMethodFilter(method.id);
                  setPaidPage(1);
                }}
                className={cn(
                  'px-3 py-1.5 rounded-xl font-medium transition-colors whitespace-nowrap cursor-pointer',
                  paidMethodFilter === method.id
                    ? 'bg-neutral-900 text-white font-semibold shadow-2xs'
                    : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                )}
              >
                {method.label}
              </button>
            ))}
          </>
        )}
      </div>

      {/* TAB CONTENTS */}

      {/* 1. PENDING TAB */}
      {activeTab === 'pending' && (
        <div className="space-y-3">
          {loadingMembers ? (
            <LoadingState message="Loading pending dues..." />
          ) : filteredPending.length === 0 ? (
            <div className="p-12 rounded-2xl bg-white border border-neutral-200/80 text-center shadow-2xs flex flex-col items-center justify-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-neutral-950">No pending payments.</h3>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-sm">
                {searchQuery ? `No pending members match "${searchQuery}".` : 'All member dues are settled and up to date.'}
              </p>
              {searchQuery && (
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchQuery('')}
                    className="text-xs"
                  >
                    Clear Search
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredPending.map((member) => {
                const diffDays = getDifferenceInDays(member.nextPaymentDate);
                const isOverdue = diffDays < 0;
                const overdueDaysCount = Math.abs(diffDays);
                const displayName = member.name || 'Member';
                const displayPhone = member.phone || 'No phone';
                const displayFee = Number(member.monthlyFee) || 0;

                return (
                  <div
                    key={member.id}
                    id={`payment-pending-card-${member.id}`}
                    className={cn(
                      'p-4 sm:p-5 rounded-2xl border transition-all shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4',
                      isOverdue
                        ? 'bg-rose-50/40 border-rose-200/90 hover:border-rose-300'
                        : 'bg-amber-50/40 border-amber-200/90 hover:border-amber-300'
                    )}
                  >
                    {/* Left: Member Identity & Urgency Badge */}
                    <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                      <Avatar name={displayName} size="md" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => handleMemberClick(member)}
                            className="font-bold text-sm sm:text-base text-neutral-950 hover:underline text-left truncate cursor-pointer max-w-[200px] sm:max-w-xs"
                          >
                            {displayName}
                          </button>

                          {/* Overdue / Due Today Badge */}
                          {isOverdue ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200/90 flex items-center gap-1 shrink-0">
                              <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" />
                              <span>Overdue · {overdueDaysCount} {overdueDaysCount === 1 ? 'day' : 'days'}</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200/90 flex items-center gap-1 shrink-0">
                              <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                              <span>Due today</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-neutral-500 mt-1 flex-wrap font-mono">
                          <a
                            href={`tel:${member.phone}`}
                            className="flex items-center gap-1 hover:text-neutral-900 transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                            <span className="truncate">{displayPhone}</span>
                          </a>
                          <span className="font-sans text-neutral-400">•</span>
                          <span className="font-sans text-neutral-600">
                            Due {formatDate(member.nextPaymentDate, { format: 'medium' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Amount & Actions (Remind + Mark Paid) */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-200/60 shrink-0">
                      <div className="text-left sm:text-right">
                        <span className="text-base sm:text-lg font-bold text-neutral-950 block">
                          {formatCurrency(displayFee, currencySymbol)}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-medium block truncate max-w-[120px]">
                          {member.planName || 'Monthly'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {onSendReminder && (
                          <Button
                            id={`btn-remind-pending-${member.id}`}
                            variant="secondary"
                            size="sm"
                            onClick={() => onSendReminder(member)}
                            className="text-xs px-3 font-semibold"
                            leftIcon={<MessageSquare className="w-3.5 h-3.5 text-neutral-600" />}
                          >
                            Remind
                          </Button>
                        )}

                        {onQuickPay && (
                          <Button
                            id={`btn-markpaid-pending-${member.id}`}
                            size="sm"
                            onClick={() => onQuickPay(member)}
                            className="bg-neutral-900 hover:bg-neutral-800 text-white text-xs px-3.5 font-semibold shadow-2xs"
                            leftIcon={<CreditCard className="w-3.5 h-3.5" />}
                          >
                            Mark Paid
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. UPCOMING TAB */}
      {activeTab === 'upcoming' && (
        <div className="space-y-3">
          {loadingMembers ? (
            <LoadingState message="Loading upcoming renewals..." />
          ) : filteredUpcoming.length === 0 ? (
            <div className="p-12 rounded-2xl bg-white border border-neutral-200/80 text-center shadow-2xs flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mb-3">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-neutral-950">No payments due soon.</h3>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-sm">
                {searchQuery ? 'No upcoming renewals match your search.' : 'No member renewals scheduled within the selected period.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredUpcoming.map((member) => {
                const diffDays = getDifferenceInDays(member.nextPaymentDate);
                const displayName = member.name || 'Member';
                const displayPhone = member.phone || 'No phone';
                const displayFee = Number(member.monthlyFee) || 0;

                return (
                  <div
                    key={member.id}
                    id={`payment-upcoming-card-${member.id}`}
                    className="p-4 sm:p-5 rounded-2xl bg-white border border-neutral-200/80 hover:border-neutral-300 transition-all shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    {/* Left: Member Info & Calmer Days Remaining Badge */}
                    <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                      <Avatar name={displayName} size="md" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => handleMemberClick(member)}
                            className="font-bold text-sm sm:text-base text-neutral-900 hover:underline text-left truncate cursor-pointer max-w-[200px] sm:max-w-xs"
                          >
                            {displayName}
                          </button>

                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-neutral-100 text-neutral-700 border border-neutral-200/80 flex items-center gap-1 shrink-0">
                            <Calendar className="w-3 h-3 text-neutral-400" />
                            <span>
                              {diffDays === 1 ? 'Due tomorrow' : `Due in ${diffDays} days`}
                            </span>
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-neutral-500 mt-1 flex-wrap font-mono">
                          <a
                            href={`tel:${member.phone}`}
                            className="flex items-center gap-1 hover:text-neutral-900 transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                            <span className="truncate">{displayPhone}</span>
                          </a>
                          <span className="font-sans text-neutral-400">•</span>
                          <span className="font-sans text-neutral-600">
                            Due {formatDate(member.nextPaymentDate, { format: 'medium' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Expected Amount & Remind Action */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100 shrink-0">
                      <div className="text-left sm:text-right">
                        <span className="text-base sm:text-lg font-bold text-neutral-900 block">
                          {formatCurrency(displayFee, currencySymbol)}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-medium block truncate max-w-[120px]">
                          {member.planName || 'Monthly'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {onSendReminder && (
                          <Button
                            id={`btn-remind-upcoming-${member.id}`}
                            variant="secondary"
                            size="sm"
                            onClick={() => onSendReminder(member)}
                            className="text-xs px-3 font-medium text-neutral-700"
                            leftIcon={<MessageSquare className="w-3.5 h-3.5 text-neutral-500" />}
                          >
                            Remind
                          </Button>
                        )}

                        {onQuickPay && (
                          <Button
                            id={`btn-markpaid-upcoming-${member.id}`}
                            variant="outline"
                            size="sm"
                            onClick={() => onQuickPay(member)}
                            className="text-xs px-3 font-medium text-neutral-700"
                            leftIcon={<CreditCard className="w-3.5 h-3.5 text-neutral-500" />}
                          >
                            Mark Paid
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. PAID TAB */}
      {activeTab === 'paid' && (
        <div className="space-y-3">
          {loadingPayments ? (
            <LoadingState message="Loading payment history..." />
          ) : filteredPaid.length === 0 ? (
            <div className="p-12 rounded-2xl bg-white border border-neutral-200/80 text-center shadow-2xs flex flex-col items-center justify-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mb-1">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-neutral-950">No payments recorded.</h3>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-sm">
                {searchQuery ? `No payment records match "${searchQuery}".` : 'Transactions recorded using the "Mark Paid" button will appear here.'}
              </p>
              {searchQuery && (
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchQuery('')}
                    className="text-xs"
                  >
                    Clear Search
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="rounded-2xl bg-white border border-neutral-200/80 shadow-2xs divide-y divide-neutral-100 overflow-hidden">
                {paginatedPaid.map((item) => {
                  const itemMemberName = item.memberName || 'Member';
                  const itemAmount = Number(item.amount) || 0;

                  return (
                    <div
                      key={item.id}
                      id={`payment-paid-row-${item.id}`}
                      onClick={() => handlePaidRecordClick(item)}
                      className="p-4 sm:px-5 flex items-center justify-between gap-3 hover:bg-neutral-50/70 transition-colors cursor-pointer"
                    >
                      {/* Left: Member info, paid date, method */}
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50/80 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200/60">
                          <Check className="w-4 h-4 text-emerald-600" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-xs sm:text-sm text-neutral-900 truncate max-w-[200px] sm:max-w-xs">
                              {itemMemberName}
                            </span>
                            <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-neutral-100 text-neutral-600 shrink-0">
                              {item.paymentMethod === 'BANK_TRANSFER'
                                ? 'Bank Transfer'
                                : item.paymentMethod || 'Cash'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-neutral-500 mt-0.5 flex-wrap font-mono">
                            {item.memberPhone && <span>{item.memberPhone}</span>}
                            {item.memberPhone && <span className="font-sans text-neutral-300">•</span>}
                            <span className="font-sans text-neutral-600">
                              Paid on {formatDate(item.paymentDate, { format: 'medium' })}
                            </span>
                            {item.notes && (
                              <>
                                <span className="font-sans text-neutral-300">•</span>
                                <span className="font-sans text-neutral-400 truncate max-w-[160px] sm:max-w-[240px]">
                                  {item.notes}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Received Amount */}
                      <div className="flex items-center gap-2.5 text-right shrink-0">
                        <div>
                          <span className="text-xs sm:text-sm font-bold text-emerald-700 block">
                            +{formatCurrency(itemAmount, currencySymbol)}
                          </span>
                          <span className="text-[10px] text-neutral-400 font-medium">Received</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-neutral-300 hidden sm:block" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination for Paid Records */}
              {totalPaidPages > 1 && (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs text-xs">
                  <span className="text-neutral-500">
                    Showing {((paidPage - 1) * PAID_PAGE_SIZE) + 1}–{Math.min(paidPage * PAID_PAGE_SIZE, totalPaidCount)} of {totalPaidCount} payments
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPaidPage((p) => Math.max(1, p - 1))}
                      disabled={paidPage === 1}
                      leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
                    >
                      Previous
                    </Button>
                    <span className="px-2 font-semibold text-neutral-700">
                      Page {paidPage} of {totalPaidPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPaidPage((p) => Math.min(totalPaidPages, p + 1))}
                      disabled={paidPage === totalPaidPages}
                      rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
