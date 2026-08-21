import React, { useState, useMemo, useEffect } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { ErrorState } from '../components/ui/ErrorState';
import { Skeleton } from '../components/ui/Skeleton';
import { StaleDataNotification } from '../components/common/StaleDataNotification';
import { Member } from '../types';
import { useMembers } from '../hooks/useMembers';
import { useGymSettings } from '../hooks/useGymSettings';
import { formatCurrency } from '../utils/currencyUtils';
import { formatDate, getDifferenceInDays } from '../utils/dateUtils';
import { Search, X, MessageSquare, Users, AlertCircle, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../utils/classNames';

interface MembersPageProps {
  onQuickPay: (member: Member) => void;
  onSendReminder: (member: Member) => void;
  onAddMember: () => void;
  onSelectMember: (member: Member) => void;
}

type FilterStatus = 'ALL' | 'ACTIVE' | 'PENDING' | 'DUE_SOON' | 'EXPIRED';
const PAGE_SIZE = 25;

export const MembersPage: React.FC<MembersPageProps> = ({
  onQuickPay,
  onSendReminder,
  onAddMember,
  onSelectMember,
}) => {
  const { members, loading, isRefreshing, isStale, error, setFilter, fetchMembers } = useMembers();
  const { currencySymbol } = useGymSettings();

  const [activeFilter, setActiveFilter] = useState<FilterStatus>('ALL');
  const [searchInput, setSearchInput] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [recentPaymentId, setRecentPaymentId] = useState<string | null>(null);

  useEffect(() => {
    const handlePaymentSuccess = (e: any) => {
      const memberId = e.detail?.memberId;
      if (memberId) {
        setRecentPaymentId(memberId);
        setTimeout(() => setRecentPaymentId(null), 3000);
      }
    };
    window.addEventListener('gymflow_payment_success', handlePaymentSuccess);
    return () => window.removeEventListener('gymflow_payment_success', handlePaymentSuccess);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    setCurrentPage(1);
    setFilter((prev) => ({ ...prev, search: value }));
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setCurrentPage(1);
    setFilter((prev) => ({ ...prev, search: '' }));
  };

  const handleFilterChange = (status: FilterStatus) => {
    setActiveFilter(status);
    setCurrentPage(1);
    setFilter((prev) => ({ ...prev, status: status }));
  };

  const filterTabs: { id: FilterStatus; label: string }[] = [
    { id: 'ALL', label: 'All' },
    { id: 'ACTIVE', label: 'Active' },
    { id: 'PENDING', label: 'Pending' },
    { id: 'DUE_SOON', label: 'Due Soon' },
    { id: 'EXPIRED', label: 'Expired' },
  ];

  const totalMembersCount = members.length;
  const totalPages = Math.ceil(totalMembersCount / PAGE_SIZE) || 1;
  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return members.slice(start, start + PAGE_SIZE);
  }, [members, currentPage]);

  const renderStatus = (member: Member) => {
    const diffDays = getDifferenceInDays(member.nextPaymentDate);
    const isOverdue = diffDays < 0;
    const isDueToday = diffDays === 0;

    if (isOverdue) {
      const days = Math.abs(diffDays);
      return (
        <span className="inline-flex items-center gap-1.5 text-rose-700 font-semibold text-sm">
          <AlertCircle className="w-4 h-4" />
          Overdue by {days} {days === 1 ? 'day' : 'days'}
        </span>
      );
    }
    if (isDueToday) {
      return (
        <span className="inline-flex items-center gap-1.5 text-amber-700 font-semibold text-sm">
          <Clock className="w-4 h-4" />
          Due today
        </span>
      );
    }
    if (diffDays <= 3) {
      return <span className="text-zinc-900 font-semibold text-sm">Due in {diffDays} {diffDays === 1 ? 'day' : 'days'}</span>;
    }
    return <span className="text-zinc-500 font-medium text-sm">Paid up • Next due {formatDate(member.nextPaymentDate, { format: 'short' })}</span>;
  };

  const isSearching = searchInput.trim().length > 0 || activeFilter !== 'ALL';
  const hasNoMembersEver = !loading && members.length === 0 && !isSearching;
  const hasNoSearchResults = !loading && members.length === 0 && isSearching;

  if (error && members.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-10">
        <ErrorState
          title="Couldn't load members list"
          message="We couldn't retrieve the members directory. Please check your connection and try again."
          onRetry={fetchMembers}
          retryLabel="Try again"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 max-w-5xl mx-auto pb-12">
      <StaleDataNotification isStale={isStale} onRetry={() => fetchMembers(true)} isRefreshing={isRefreshing} />

      <PageHeader
        title="Members"
        subtitle="Manage your gym members and their payments."
        actions={<Button size="md" onClick={onAddMember}>Add Member</Button>}
      />

      <div className="space-y-4 pt-2">
        <div className="relative w-full max-w-2xl">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={searchInput}
            onChange={handleSearchChange}
            placeholder="Search by name or phone..."
            className="w-full pl-11 pr-11 py-3.5 bg-white border border-zinc-200 shadow-sm rounded-2xl text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
          />
          {searchInput && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-400 hover:text-zinc-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {filterTabs.map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleFilterChange(tab.id)}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all cursor-pointer',
                  isActive
                    ? 'bg-zinc-900 text-white shadow-sm'
                    : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {loading && members.length === 0 ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="py-4 border-b border-zinc-100 flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          ))}
        </div>
      ) : hasNoMembersEver ? (
        <div className="py-24 flex flex-col items-center justify-center text-center bg-zinc-50/50 rounded-3xl border border-zinc-100 mt-4">
          <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-zinc-100 text-zinc-400 flex items-center justify-center mb-6">
            <Users className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-zinc-950">Add your first member</h2>
          <p className="text-base text-zinc-500 mt-2 max-w-md">
            Start tracking memberships, collecting payments, and sending WhatsApp reminders from one place.
          </p>
          <div className="mt-8">
            <Button size="lg" onClick={onAddMember}>Add Member</Button>
          </div>
        </div>
      ) : hasNoSearchResults ? (
        <div className="py-24 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-zinc-50 text-zinc-400 flex items-center justify-center mb-4">
            <Search className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-zinc-950">No members found</h2>
          <p className="text-base text-zinc-500 mt-2 max-w-md">
            {searchInput ? `We couldn't find anyone matching "${searchInput}".` : 'No members found with the current filter.'}
          </p>
          <div className="mt-6 flex gap-3">
            {searchInput && <Button variant="outline" onClick={handleClearSearch}>Clear Search</Button>}
            {activeFilter !== 'ALL' && <Button variant="secondary" onClick={() => handleFilterChange('ALL')}>View All Members</Button>}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {paginatedMembers.map((member) => {
            const diffDays = getDifferenceInDays(member.nextPaymentDate);
            const isPending = diffDays <= 0;
            const displayName = member.name || 'Member';
            const displayFee = Number(member.monthlyFee) || 0;

            return (
              <div
                key={member.id}
                className={cn(
                  "py-4 sm:py-5 px-2 sm:px-4 -mx-2 sm:-mx-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors cursor-pointer group",
                  recentPaymentId === member.id ? "bg-emerald-50" : "hover:bg-zinc-50/70"
                )}
                onClick={() => onSelectMember(member)}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <Avatar name={displayName} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-lg text-zinc-950 truncate max-w-[200px] sm:max-w-xs transition-colors group-hover:text-zinc-700">
                        {displayName}
                      </span>
                      <span className="text-zinc-400 font-mono text-sm hidden sm:inline-block">{member.phone}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-3 flex-wrap">
                      {renderStatus(member)}
                      <span className="text-zinc-300 hidden sm:inline-block">•</span>
                      <span className="text-zinc-500 text-sm">
                        {member.planName || 'Standard'} ({formatCurrency(displayFee, currencySymbol)})
                      </span>
                    </div>
                  </div>
                </div>

                {isPending && (
                  <div className="flex items-center gap-2 pt-2 sm:pt-0 sm:shrink-0 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="md"
                      className="w-full sm:w-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSendReminder(member);
                      }}
                      leftIcon={<MessageSquare className="w-4 h-4" />}
                    >
                      <span className="sm:hidden">Remind</span>
                    </Button>
                    <Button
                      size="md"
                      className="w-full sm:w-auto bg-zinc-900 text-white hover:bg-zinc-800"
                      onClick={(e) => {
                        e.stopPropagation();
                        onQuickPay(member);
                      }}
                    >
                      Mark Paid
                    </Button>
                  </div>
                )}
              </div>
            );
          })}

          {totalPages > 1 && (
            <div className="flex items-center justify-between py-6 border-t border-zinc-100 mt-6 text-sm">
              <span className="text-zinc-500 hidden sm:inline-block">
                Showing {((currentPage - 1) * PAGE_SIZE) + 1}–{Math.min(currentPage * PAGE_SIZE, totalMembersCount)} of {totalMembersCount} members
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  leftIcon={<ChevronLeft className="w-4 h-4" />}
                >
                  Previous
                </Button>
                <span className="px-3 font-semibold text-zinc-700 sm:hidden">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
