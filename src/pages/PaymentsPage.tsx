import React, { useState, useMemo } from 'react';
import { Button } from '../components/ui/Button';
import { SearchInput } from '../components/ui/SearchInput';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { MemberRowSkeleton, ListSectionSkeleton } from '../components/ui/Skeleton';
import { StaleDataNotification } from '../components/common/StaleDataNotification';
import { LoadMore } from '../components/ui/LoadMore';
import { Avatar } from '../components/ui/Avatar';
import { TwoTierNumber } from '../components/ui/TwoTierNumber';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Member, Payment, PaymentMethod } from '../types';
import { useMembers } from '../hooks/useMembers';
import { usePayments } from '../hooks/usePayments';
import { useDelayedLoading } from '../hooks/useDelayedLoading';
import { useGymSettings } from '../hooks/useGymSettings';
import { formatCurrency } from '../utils/currencyUtils';
import { formatDate, getDifferenceInDays } from '../utils/dateUtils';
import { MemberRow } from '../components/ui/MemberRow';
import {
  CreditCard,
  CheckCircle2,
  CalendarCheck,
  Receipt,
  Search,
  RotateCw,
  Download,
  Smartphone,
  Banknote,
  Building2,
  ArrowRight,
  Clock,
  AlertCircle
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
  const { 
    members, 
    loading: loadingMembers, 
    isRefreshing, 
    isStale, 
    error: membersError, 
    fetchMembers 
  } = useMembers();
  const { 
    payments, 
    loading: loadingPayments, 
    error: paymentsError, 
    fetchPayments 
  } = usePayments();

  const showLoadingMembers = useDelayedLoading(loadingMembers, 300);
  const showLoadingPayments = useDelayedLoading(loadingPayments, 300);
  const { currencySymbol } = useGymSettings();

  // Navigation State: 'pending' (Default) | 'upcoming' | 'paid'
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [paidPage, setPaidPage] = useState<number>(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Sub-filter for Paid tab (All / UPI / Cash / Bank Transfer)
  const [paidMethodFilter, setPaidMethodFilter] = useState<string>('ALL');

  // 1. Compute Pending List (Overdue + Due today, sorted by urgency)
  const pendingMembers = useMemo(() => {
    return members
      .filter((m) => {
        if (m.status !== 'ACTIVE') return false;
        const diff = getDifferenceInDays(m.nextPaymentDate);
        return diff <= 0;
      })
      .sort((a, b) => {
        const diffA = getDifferenceInDays(a.nextPaymentDate);
        const diffB = getDifferenceInDays(b.nextPaymentDate);
        return diffA - diffB;
      });
  }, [members]);

  // 2. Compute Upcoming List (Future renewals, closest first)
  const upcomingMembers = useMemo(() => {
    return members
      .filter((m) => {
        if (m.status !== 'ACTIVE') return false;
        const diff = getDifferenceInDays(m.nextPaymentDate);
        return diff > 0;
      })
      .sort((a, b) => {
        const diffA = getDifferenceInDays(a.nextPaymentDate);
        const diffB = getDifferenceInDays(b.nextPaymentDate);
        return diffA - diffB;
      });
  }, [members]);

  // 3. Filter Pending List by search
  const filteredPending = useMemo(() => {
    if (!searchQuery.trim()) return pendingMembers;
    const q = searchQuery.toLowerCase().trim();
    return pendingMembers.filter(
      (m) => (m.name || '').toLowerCase().includes(q) || (m.phone || '').includes(q)
    );
  }, [pendingMembers, searchQuery]);

  // 4. Filter Upcoming List by search
  const filteredUpcoming = useMemo(() => {
    if (!searchQuery.trim()) return upcomingMembers;
    const q = searchQuery.toLowerCase().trim();
    return upcomingMembers.filter(
      (m) => (m.name || '').toLowerCase().includes(q) || (m.phone || '').includes(q)
    );
  }, [upcomingMembers, searchQuery]);

  // 5. Filter Paid List by search & payment method
  const filteredPaid = useMemo(() => {
    return payments.filter((p) => {
      if (paidMethodFilter !== 'ALL' && p.paymentMethod !== paidMethodFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = (p.memberName || '').toLowerCase().includes(q);
        const matchesPhone = (p.memberPhone || '').includes(q);
        const matchesNotes = (p.notes || '').toLowerCase().includes(q);
        return matchesName || matchesPhone || matchesNotes;
      }
      return true;
    });
  }, [payments, paidMethodFilter, searchQuery]);

  const paginatedPaid = useMemo(() => {
    return filteredPaid.slice(0, paidPage * PAID_PAGE_SIZE);
  }, [filteredPaid, paidPage]);
  const hasMorePaid = paidPage * PAID_PAGE_SIZE < filteredPaid.length;

  const handleLoadMorePaid = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setPaidPage((p) => p + 1);
      setIsLoadingMore(false);
    }, 300);
  };

  const handleRefresh = () => {
    fetchMembers(false);
    fetchPayments();
  };

  const handleExportCSV = () => {
    if (!payments || payments.length === 0) return;
    const headers = ['Date', 'Member Name', 'Phone', 'Amount', 'Method', 'Notes', 'Recorded By'];
    const rows = payments.map((p) => [
      `"${p.paymentDate}"`,
      `"${(p.memberName || '').replace(/"/g, '""')}"`,
      `"${(p.memberPhone || '').replace(/"/g, '""')}"`,
      p.amount,
      `"${p.paymentMethod || 'CASH'}"`,
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

  const getMethodIcon = (method: string) => {
    switch ((method || '').toUpperCase()) {
      case 'UPI':
        return <Smartphone className="w-3.5 h-3.5" />;
      case 'CARD':
        return <CreditCard className="w-3.5 h-3.5" />;
      case 'BANK_TRANSFER':
        return <Building2 className="w-3.5 h-3.5" />;
      case 'CASH':
      default:
        return <Banknote className="w-3.5 h-3.5" />;
    }
  };

  if ((membersError && members.length === 0) || (paymentsError && payments.length === 0)) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <ErrorState
          title="Couldn't load payments"
          message="We were unable to retrieve payment ledger records. Please check your connection and try again."
          onRetry={handleRefresh}
          retryLabel="Try again"
        />
      </div>
    );
  }

  return (
    <div className="space-y-5 select-none font-sans max-w-7xl mx-auto">
      <StaleDataNotification 
        isStale={isStale} 
        onRetry={() => { fetchMembers(true); fetchPayments(); }} 
        isRefreshing={isRefreshing} 
      />

      {/* Top Header & Ledger Navigation Strip */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* 3-Tab Segmented Switcher */}
          <div className="flex items-center p-1 bg-neutral-100/90 rounded-[var(--radius-lg)] border border-neutral-200/80 shrink-0 self-start">
            <button
              type="button"
              onClick={() => { setActiveTab('pending'); setPaidPage(1); }}
              className={cn(
                'px-3.5 py-1.5 text-xs font-bold rounded-[var(--radius-md)] transition-all cursor-pointer flex items-center gap-1.5',
                activeTab === 'pending'
                  ? 'bg-white text-neutral-950 shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              )}
            >
              <span>Pending</span>
              {pendingMembers.length > 0 && (
                <span className="px-1.5 py-0.2 bg-[var(--color-danger-50)] text-[var(--color-danger-700)] rounded-full text-[10px] font-mono font-bold">
                  {pendingMembers.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('upcoming'); setPaidPage(1); }}
              className={cn(
                'px-3.5 py-1.5 text-xs font-bold rounded-[var(--radius-md)] transition-all cursor-pointer flex items-center gap-1.5',
                activeTab === 'upcoming'
                  ? 'bg-white text-neutral-950 shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              )}
            >
              <span>Upcoming</span>
              {upcomingMembers.length > 0 && (
                <span className="px-1.5 py-0.2 bg-neutral-200/80 text-neutral-700 rounded-full text-[10px] font-mono font-bold">
                  {upcomingMembers.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('paid'); setPaidPage(1); }}
              className={cn(
                'px-3.5 py-1.5 text-xs font-bold rounded-[var(--radius-md)] transition-all cursor-pointer flex items-center gap-1.5',
                activeTab === 'paid'
                  ? 'bg-white text-neutral-950 shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              )}
            >
              <span>Paid History</span>
              <span className="px-1.5 py-0.2 bg-neutral-200/80 text-neutral-700 rounded-full text-[10px] font-mono font-bold">
                {payments.length}
              </span>
            </button>
          </div>

          {/* Right Controls: Search + Refresh + Export */}
          <div className="flex items-center gap-2">
            <div className="w-full sm:w-60">
              <SearchInput
                value={searchQuery}
                onSearchChange={setSearchQuery}
                placeholder="Search member..."
              />
            </div>

            {activeTab === 'paid' && payments.length > 0 && (
              <button
                type="button"
                onClick={handleExportCSV}
                title="Export CSV"
                className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 transition-colors border border-neutral-200/80 cursor-pointer shadow-2xs shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={handleRefresh}
              aria-label="Refresh payments"
              className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-500 hover:text-neutral-950 hover:bg-neutral-100 transition-colors border border-neutral-200/80 cursor-pointer shadow-2xs shrink-0"
              title="Refresh"
            >
              <RotateCw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin")} />
            </button>
          </div>
        </div>

        {/* Paid Tab Method Filter Sub-Bar */}
        {activeTab === 'paid' && (
          <div className="flex items-center gap-1.5 pt-1 overflow-x-auto no-scrollbar">
            {['ALL', 'UPI', 'CASH', 'BANK_TRANSFER'].map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => setPaidMethodFilter(method)}
                className={cn(
                  'px-2.5 py-1 text-[11px] font-bold rounded-[var(--radius-full)] transition-colors cursor-pointer border',
                  paidMethodFilter === method
                    ? 'bg-neutral-950 text-white border-neutral-950'
                    : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300'
                )}
              >
                {method === 'ALL' ? 'All Methods' : method === 'BANK_TRANSFER' ? 'Bank Transfer' : method}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. TAB: PENDING PAYMENTS (Overdue & Due Today)                            */}
      {/* ========================================================================= */}
      {activeTab === 'pending' && (
        <section aria-label="Pending Payments">
          {showLoadingMembers && members.length === 0 ? (
            <div className="bg-white border border-neutral-200/80 rounded-[var(--radius-lg)] shadow-2xs divide-y divide-neutral-100 overflow-hidden">
              {[1, 2, 3, 4].map((i) => (
                <MemberRowSkeleton key={i} />
              ))}
            </div>
          ) : filteredPending.length === 0 ? (
            <EmptyState
              icon={searchQuery ? <Search className="w-8 h-8 stroke-[1.5]" /> : <CheckCircle2 className="w-8 h-8 stroke-[1.5]" />}
              title={searchQuery ? 'No pending dues match search' : 'All caught up! No dues pending'}
              description={
                searchQuery
                  ? `No members with pending dues match "${searchQuery}".`
                  : 'Every active gym member is paid up. There are no overdue or due today accounts.'
              }
              actionLabel={searchQuery ? 'Clear Search' : undefined}
              onAction={searchQuery ? () => setSearchQuery('') : undefined}
              className="py-16 bg-white border border-neutral-200/80 shadow-2xs"
            />
          ) : (
            <div className="bg-white border border-neutral-200/80 rounded-[var(--radius-lg)] shadow-2xs divide-y divide-neutral-100 overflow-hidden">
              {filteredPending.map((member) => (
                <MemberRow
                  key={member.id}
                  member={member}
                  currencySymbol={currencySymbol}
                  onSelect={onSelectMember}
                  onRemind={onSendReminder}
                  onQuickPay={onQuickPay}
                  primaryAction="pay"
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ========================================================================= */}
      {/* 2. TAB: UPCOMING RENEWALS (Future Dues)                                   */}
      {/* ========================================================================= */}
      {activeTab === 'upcoming' && (
        <section aria-label="Upcoming Renewals">
          {showLoadingMembers && members.length === 0 ? (
            <div className="bg-white border border-neutral-200/80 rounded-[var(--radius-lg)] shadow-2xs divide-y divide-neutral-100 overflow-hidden">
              {[1, 2, 3, 4].map((i) => (
                <MemberRowSkeleton key={i} />
              ))}
            </div>
          ) : filteredUpcoming.length === 0 ? (
            <EmptyState
              icon={searchQuery ? <Search className="w-8 h-8 stroke-[1.5]" /> : <CalendarCheck className="w-8 h-8 stroke-[1.5]" />}
              title={searchQuery ? 'No upcoming renewals match search' : 'No upcoming renewals scheduled'}
              description={
                searchQuery
                  ? `No upcoming renewals match "${searchQuery}".`
                  : 'There are no active member renewals scheduled in the upcoming period.'
              }
              actionLabel={searchQuery ? 'Clear Search' : undefined}
              onAction={searchQuery ? () => setSearchQuery('') : undefined}
              className="py-16 bg-white border border-neutral-200/80 shadow-2xs"
            />
          ) : (
            <div className="bg-white border border-neutral-200/80 rounded-[var(--radius-lg)] shadow-2xs divide-y divide-neutral-100 overflow-hidden">
              {filteredUpcoming.map((member) => (
                <MemberRow
                  key={member.id}
                  member={member}
                  currencySymbol={currencySymbol}
                  onSelect={onSelectMember}
                  onRemind={onSendReminder}
                  onQuickPay={onQuickPay}
                  primaryAction="remind"
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ========================================================================= */}
      {/* 3. TAB: PAID HISTORY LEDGER                                               */}
      {/* ========================================================================= */}
      {activeTab === 'paid' && (
        <section aria-label="Paid History Ledger">
          {showLoadingPayments && payments.length === 0 ? (
            <div className="bg-white border border-neutral-200/80 rounded-[var(--radius-lg)] shadow-2xs divide-y divide-neutral-100 overflow-hidden">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="p-4 flex items-center justify-between animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-neutral-200" />
                    <div className="space-y-1.5">
                      <div className="w-32 h-3.5 bg-neutral-200 rounded" />
                      <div className="w-20 h-2.5 bg-neutral-100 rounded" />
                    </div>
                  </div>
                  <div className="w-16 h-4 bg-neutral-200 rounded" />
                </div>
              ))}
            </div>
          ) : filteredPaid.length === 0 ? (
            <EmptyState
              icon={searchQuery || paidMethodFilter !== 'ALL' ? <Search className="w-8 h-8 stroke-[1.5]" /> : <Receipt className="w-8 h-8 stroke-[1.5]" />}
              title={searchQuery || paidMethodFilter !== 'ALL' ? 'No transactions found' : 'No recorded transactions'}
              description={
                searchQuery || paidMethodFilter !== 'ALL'
                  ? 'No payment records match your search or filter.'
                  : 'When you record member payments, receipts and transaction logs will be listed here.'
              }
              actionLabel={searchQuery || paidMethodFilter !== 'ALL' ? 'Clear Filters' : undefined}
              onAction={() => { setSearchQuery(''); setPaidMethodFilter('ALL'); }}
              className="py-16 bg-white border border-neutral-200/80 shadow-2xs"
            />
          ) : (
            <div className="space-y-4">
              <div className="bg-white border border-neutral-200/80 rounded-[var(--radius-lg)] shadow-2xs divide-y divide-neutral-100 overflow-hidden">
                {paginatedPaid.map((item) => {
                  const itemAmt = Number(item.amount) || 0;
                  return (
                    <div
                      key={item.id}
                      onClick={() => item.memberId && onSelectMemberById && onSelectMemberById(item.memberId)}
                      className={cn(
                        'p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-neutral-50/80 transition-colors',
                        item.memberId && onSelectMemberById && 'cursor-pointer'
                      )}
                    >
                      {/* Left: Member & Method */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Avatar name={item.memberName || 'Member'} size="sm" />
                        <div className="min-w-0 flex-1">
                          <span className="font-bold text-xs sm:text-sm text-neutral-900 block truncate">
                            {item.memberName || 'Member'}
                          </span>
                          <div className="flex items-center gap-2 text-[11px] text-neutral-500 mt-0.5 flex-wrap">
                            <span className="flex items-center gap-1 font-mono text-[10px] uppercase font-bold text-neutral-700 bg-neutral-100 px-1.5 py-0.5 rounded">
                              {getMethodIcon(item.paymentMethod)}
                              {item.paymentMethod || 'CASH'}
                            </span>
                            <span>·</span>
                            <span>{formatDate(item.paymentDate, { format: 'medium' })}</span>
                            {item.notes && (
                              <>
                                <span>·</span>
                                <span className="truncate max-w-[140px] text-neutral-400">{item.notes}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Amount Received */}
                      <div className="text-right shrink-0">
                        <TwoTierNumber
                          value={`+${formatCurrency(itemAmt, currencySymbol)}`}
                          caption="Received"
                          size="sm"
                          align="right"
                          valueClassName="text-[var(--color-success-700)] font-mono"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {hasMorePaid && (
                <div className="pt-2 flex justify-center">
                  <LoadMore
                    onLoadMore={handleLoadMorePaid}
                    isLoading={isLoadingMore}
                    hasMore={hasMorePaid}
                  />
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
};
