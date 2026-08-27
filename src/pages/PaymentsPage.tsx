import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { SearchInput } from '../components/ui/SearchInput';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { Skeleton, MemberRowSkeleton } from '../components/ui/Skeleton';
import { StaleDataNotification } from '../components/common/StaleDataNotification';
import { ListSection, LoadMore } from '../components/ui';
import { Avatar } from '../components/ui/Avatar';
import { Member, Payment, PaymentMethod } from '../types';
import { useMembers } from '../hooks/useMembers';
import { usePayments } from '../hooks/usePayments';
import { useDelayedLoading } from '../hooks/useDelayedLoading';
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
import { FilterChips, FilterChipOption } from '../components/ui/FilterChips';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { MemberRow } from '../components/ui/MemberRow';
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
  const showLoadingMembers = useDelayedLoading(loadingMembers, 400);
  const showLoadingPayments = useDelayedLoading(loadingPayments, 400);
  const { currencySymbol } = useGymSettings();

  // Primary Tabs: Pending (Default), Upcoming, Paid
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [paidPage, setPaidPage] = useState<number>(1);

  // Minimal sub-filters
  const [pendingFilter, setPendingFilter] = useState<'ALL' | 'OVERDUE' | 'TODAY'>('ALL');
  const [upcomingFilter, setUpcomingFilter] = useState<'ALL' | '7_DAYS' | '14_DAYS' | '30_DAYS'>('ALL');
  const [paidMethodFilter, setPaidMethodFilter] = useState<string>('ALL');

  // Load More state for Paid tab
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const handleLoadMorePaid = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setPaidPage(p => p + 1);
      setIsLoadingMore(false);
    }, 400);
  };

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
  const paginatedPaid = useMemo(() => {
    return filteredPaid.slice(0, paidPage * PAID_PAGE_SIZE);
  }, [filteredPaid, paidPage]);
  const hasMorePaid = paidPage * PAID_PAGE_SIZE < totalPaidCount;

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
    <div className="space-y-6 sm:space-y-8 pb-12">
      <StaleDataNotification
        isStale={isStale}
        onRetry={() => {
          fetchMembers(true);
          fetchPayments();
        }}
        isRefreshing={isRefreshing}
      />
      <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-2 shrink-0">
        {payments.length > 0 && (
          <Button
            id="btn-payments-export-csv"
            variant="tertiary"
            size="md"
            onClick={handleExportCSV}
          >
            Export CSV
          </Button>
        )}
        {onRecordPayment && (
          <Button
            id="btn-payments-record-payment"
            variant="primary"
            size="md"
            onClick={onRecordPayment}
          >
            Record Payment
          </Button>
        )}
      </div>

      {/* Primary Tab Navigation & Controls */}
      <div className="pt-1">
        {/* Primary Tabs (Macro) */}
        <div className="w-full md:w-[480px]">
          <SegmentedControl
            options={[
              { value: 'pending', label: 'Pending', count: pendingMembers.length, badgeVariant: pendingMembers.length > 0 ? 'danger' : 'neutral' },
              { value: 'upcoming', label: 'Upcoming', count: upcomingMembers.length, badgeVariant: 'warning' },
              { value: 'paid', label: 'Paid', count: payments.length, badgeVariant: 'success' },
            ]}
            value={activeTab}
            onChange={(value) => setActiveTab(value as TabType)}
          />
        </div>
      </div>

      {/* Sub-filters & Search Strip (Micro) */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4 pt-2 scrollbar-none w-full">
        <div className="w-[260px] shrink-0">
          <SearchInput
            placeholder="Search name or phone..."
            value={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>
        
        <div className="w-px h-6 bg-neutral-200 shrink-0 mx-1" />

        {activeTab === 'pending' && (
          <FilterChips
            options={[
              { id: 'ALL', label: 'All Pending', count: pendingMembers.length },
              { id: 'OVERDUE', label: 'Overdue Only', count: pendingMembers.filter((m) => getDifferenceInDays(m.nextPaymentDate) < 0).length, badgeVariant: 'danger', icon: <AlertCircle className="w-4 h-4" /> },
              { id: 'TODAY', label: 'Due Today', count: pendingMembers.filter((m) => getDifferenceInDays(m.nextPaymentDate) === 0).length, badgeVariant: 'warning', icon: <Clock className="w-4 h-4" /> },
            ]}
            activeId={pendingFilter}
            onChange={(id) => setPendingFilter(id as any)}
            className="pb-0"
          />
        )}

        {activeTab === 'upcoming' && (
          <FilterChips
            options={[
              { id: 'ALL', label: 'All Upcoming', count: upcomingMembers.length },
              { id: '7_DAYS', label: 'Next 7 Days', count: upcomingMembers.filter((m) => getDifferenceInDays(m.nextPaymentDate) <= 7).length },
              { id: '14_DAYS', label: 'Next 14 Days', count: upcomingMembers.filter((m) => getDifferenceInDays(m.nextPaymentDate) <= 14).length },
              { id: '30_DAYS', label: 'Next 30 Days', count: upcomingMembers.filter((m) => getDifferenceInDays(m.nextPaymentDate) <= 30).length },
            ]}
            activeId={upcomingFilter}
            onChange={(id) => setUpcomingFilter(id as any)}
            className="pb-0"
          />
        )}

        {activeTab === 'paid' && (
          <FilterChips
            options={[
              { id: 'ALL', label: 'All Methods' },
              { id: 'UPI', label: 'UPI' },
              { id: 'CASH', label: 'Cash' },
              { id: 'BANK_TRANSFER', label: 'Bank Transfer' },
              { id: 'OTHER', label: 'Other' },
            ]}
            activeId={paidMethodFilter}
            onChange={(id) => {
              setPaidMethodFilter(id);
              setPaidPage(1);
            }}
            className="pb-0"
          />
        )}
      </div>

      {/* TAB CONTENTS */}
      <AnimatePresence mode="wait">
        {/* 1. PENDING TAB */}
        {activeTab === 'pending' && (
          <motion.div
            key="pending"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="space-y-3"
          >
            {showLoadingMembers ? (
              <div className="flex flex-col gap-2">
                {[1, 2, 3].map(i => <MemberRowSkeleton key={i} />)}
              </div>
            ) : filteredPending.length === 0 ? (
              <div className="pt-8">
                <EmptyState
                  icon={<CheckCircle2 />}
                  title="No pending payments"
                  description={searchQuery ? `No pending members match "${searchQuery}".` : 'All member dues are settled and up to date.'}
                  actionLabel={searchQuery ? "Clear Search" : undefined}
                  onAction={searchQuery ? () => setSearchQuery('') : undefined}
                />
              </div>
            ) : (
              <ListSection
                title={pendingFilter === 'ALL' ? 'All Pending' : pendingFilter === 'OVERDUE' ? 'Overdue' : 'Due Today'}
                count={filteredPending.length}
                badgeVariant={pendingFilter === 'OVERDUE' ? 'danger' : 'warning'}
              >
                {filteredPending.map((member) => (
                  <MemberRow
                    key={member.id}
                    member={member}
                    currencySymbol={currencySymbol}
                    onSelect={handleMemberClick}
                    onRemind={onSendReminder}
                    onQuickPay={onQuickPay}
                  />
                ))}
              </ListSection>
            )}
          </motion.div>
        )}

        {/* 2. UPCOMING TAB */}
        {activeTab === 'upcoming' && (
          <motion.div
            key="upcoming"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="space-y-3"
          >
            {showLoadingMembers ? (
              <div className="flex flex-col gap-2">
                {[1, 2, 3].map(i => <MemberRowSkeleton key={i} />)}
              </div>
            ) : filteredUpcoming.length === 0 ? (
              <div className="pt-8">
                <EmptyState
                  icon={<Calendar />}
                  title="No payments due soon"
                  description={searchQuery ? 'No upcoming renewals match your search.' : 'No member renewals scheduled within the selected period.'}
                  actionLabel={searchQuery ? "Clear Search" : undefined}
                  onAction={searchQuery ? () => setSearchQuery('') : undefined}
                />
              </div>
            ) : (
              <ListSection
                title={upcomingFilter === 'ALL' ? 'All Upcoming' : `Next ${upcomingFilter.split('_')[0]} Days`}
                count={filteredUpcoming.length}
                badgeVariant="neutral"
              >
                {filteredUpcoming.map((member) => (
                  <MemberRow
                    key={member.id}
                    member={member}
                    currencySymbol={currencySymbol}
                    onSelect={handleMemberClick}
                    onRemind={onSendReminder}
                    onQuickPay={onQuickPay}
                  />
                ))}
              </ListSection>
            )}
          </motion.div>
        )}

        {/* 3. PAID TAB */}
        {activeTab === 'paid' && (
          <motion.div
            key="paid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="space-y-3"
          >
            {showLoadingPayments ? (
              <div className="flex flex-col gap-2">
                {[1, 2, 3, 4].map(i => <MemberRowSkeleton key={i} />)}
              </div>
            ) : filteredPaid.length === 0 ? (
              <div className="pt-8">
                <EmptyState
                  icon={<CreditCard />}
                  title="No payments recorded"
                  description={searchQuery ? `No payment records match "${searchQuery}".` : 'Transactions recorded using the "Mark Paid" button will appear here.'}
                  actionLabel={searchQuery ? "Clear Search" : undefined}
                  onAction={searchQuery ? () => setSearchQuery('') : undefined}
                />
              </div>
            ) : (
              <ListSection
                title={paidMethodFilter === 'ALL' ? 'All Received Payments' : `${paidMethodFilter} Payments`}
                count={totalPaidCount}
                badgeVariant="success"
              >
                {paginatedPaid.map((item) => {
                  const itemMemberName = item.memberName || 'Member';
                  const itemAmount = Number(item.amount) || 0;

                  return (
                    <div
                      key={item.id}
                      id={`payment-paid-row-${item.id}`}
                      onClick={() => handlePaidRecordClick(item)}
                      className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-[var(--radius-xl)] bg-white border border-neutral-100 transition-all duration-200 hover:shadow-[0_4px_20px_rgba(15,23,42,0.05)] cursor-pointer overflow-hidden"
                    >
                      {/* Left: Member info, paid date, method */}
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <Avatar name={itemMemberName} size="md" />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-[length:var(--text-body-size)] text-neutral-900 truncate">
                              {itemMemberName}
                            </span>
                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-[var(--radius-sm)] border border-neutral-200 bg-neutral-50 text-neutral-600 shrink-0">
                              {item.paymentMethod === 'BANK_TRANSFER'
                                ? 'Bank Transfer'
                                : item.paymentMethod || 'Cash'}
                            </span>
                          </div>

                          <div className="mt-1.5 flex items-center gap-3">
                            {item.memberPhone && (
                              <span className="text-[length:var(--text-caption-size)] text-neutral-600 font-mono tracking-tight">{item.memberPhone}</span>
                            )}
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[var(--radius-sm)] border border-[var(--color-success-200)] bg-[var(--color-success-50)] text-[11px] font-bold uppercase tracking-wider text-[var(--color-success-700)]">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-success-600)]" />
                              Paid {formatDate(item.paymentDate, { format: 'short' })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Received Amount */}
                      <div className="flex items-center gap-2.5 text-right shrink-0">
                        <div className="text-right mr-2">
                          <span className="text-[length:var(--text-subtitle-size)] tabular-nums font-mono font-bold text-[var(--color-success-700)] block tracking-tight">
                            +{formatCurrency(itemAmount, currencySymbol)}
                          </span>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mt-0.5 block">
                            Received
                          </span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-neutral-50 flex items-center justify-center border border-neutral-100 group-hover:bg-neutral-100 transition-colors hidden sm:flex">
                          <ChevronRight className="w-4 h-4 text-neutral-400" />
                        </div>
                      </div>
                    </div>
                  );
                })}

                <LoadMore 
                  isLoading={isLoadingMore}
                  hasMore={hasMorePaid}
                  onLoadMore={handleLoadMorePaid}
                />
              </ListSection>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
