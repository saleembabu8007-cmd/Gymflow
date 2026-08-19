import React, { useState, useMemo, useCallback } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Avatar } from '../components/ui/Avatar';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Button } from '../components/ui/Button';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { StaleDataNotification } from '../components/common/StaleDataNotification';
import { Member, PAYMENT_STATUS } from '../types';
import { useMembers } from '../hooks/useMembers';
import { useGymSettings } from '../hooks/useGymSettings';
import { formatCurrency } from '../utils/currencyUtils';
import { formatDate, getDifferenceInDays } from '../utils/dateUtils';
import {
  Plus,
  Search,
  X,
  Phone,
  Eye,
  CreditCard,
  MessageSquare,
  Users,
  AlertCircle,
  Clock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
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

  // Debounced search / filter synchronization
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    setCurrentPage(1);
    setFilter((prev) => ({
      ...prev,
      search: value,
    }));
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setCurrentPage(1);
    setFilter((prev) => ({
      ...prev,
      search: '',
    }));
  };

  const handleFilterChange = (status: FilterStatus) => {
    setActiveFilter(status);
    setCurrentPage(1);
    setFilter((prev) => ({
      ...prev,
      status: status,
    }));
  };

  const filterTabs: { id: FilterStatus; label: string }[] = [
    { id: 'ALL', label: 'All' },
    { id: 'ACTIVE', label: 'Active' },
    { id: 'PENDING', label: 'Pending' },
    { id: 'DUE_SOON', label: 'Due Soon' },
    { id: 'EXPIRED', label: 'Expired' },
  ];

  // Pagination calculations for 100+ member scaling
  const totalMembersCount = members.length;
  const totalPages = Math.ceil(totalMembersCount / PAGE_SIZE) || 1;
  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return members.slice(start, start + PAGE_SIZE);
  }, [members, currentPage]);

  // Helper to format the relative next payment message
  const renderNextPaymentTag = (member: Member) => {
    const diff = getDifferenceInDays(member.nextPaymentDate);
    const dateFormatted = formatDate(member.nextPaymentDate, { format: 'short' });

    if (diff < 0) {
      const overdueDays = Math.abs(diff);
      return (
        <div>
          <span className="font-semibold text-rose-700 text-xs block">
            {dateFormatted}
          </span>
          <span className="text-[10px] text-rose-600 font-medium">
            {overdueDays} {overdueDays === 1 ? 'day overdue' : 'days overdue'}
          </span>
        </div>
      );
    }

    if (diff === 0) {
      return (
        <div>
          <span className="font-semibold text-amber-700 text-xs block">
            {dateFormatted}
          </span>
          <span className="text-[10px] text-amber-600 font-medium">
            Due Today
          </span>
        </div>
      );
    }

    if (diff <= 3) {
      return (
        <div>
          <span className="font-semibold text-neutral-900 text-xs block">
            {dateFormatted}
          </span>
          <span className="text-[10px] text-amber-600 font-medium">
            In {diff} {diff === 1 ? 'day' : 'days'}
          </span>
        </div>
      );
    }

    return (
      <div>
        <span className="font-medium text-neutral-800 text-xs block">
          {dateFormatted}
        </span>
        <span className="text-[10px] text-neutral-400">
          In {diff} days
        </span>
      </div>
    );
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
    <div className="space-y-6 max-w-6xl mx-auto">
      <StaleDataNotification
        isStale={isStale}
        onRetry={() => fetchMembers(true)}
        isRefreshing={isRefreshing}
      />

      {/* 1. Page Header */}
      <PageHeader
        title="Members"
        subtitle="Manage your gym members and their payments."
        actions={
          <Button
            id="btn-members-add-member"
            size="md"
            onClick={onAddMember}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Member
          </Button>
        }
      />

      {/* 2. Prominent Search & Simple Filters */}
      <div className="space-y-3">
        {/* Prominent Search Bar */}
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            id="members-search-input"
            value={searchInput}
            onChange={handleSearchChange}
            placeholder="Search member name or phone"
            className="w-full pl-10 pr-10 py-2.5 bg-white border border-neutral-200/90 rounded-2xl text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all shadow-2xs"
          />
          {searchInput && (
            <button
              type="button"
              id="members-clear-search-btn"
              onClick={handleClearSearch}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-700 cursor-pointer"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Simple Filters Tabs */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {filterTabs.map((tab) => {
              const isActive = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  id={`filter-tab-${tab.id.toLowerCase()}`}
                  onClick={() => handleFilterChange(tab.id)}
                  className={cn(
                    'px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer',
                    isActive
                      ? 'bg-neutral-900 text-white shadow-2xs'
                      : 'bg-white border border-neutral-200/80 text-neutral-600 hover:bg-neutral-100/80 hover:text-neutral-900'
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <span className="text-xs text-neutral-400 whitespace-nowrap pl-2 hidden sm:inline">
            {totalMembersCount} {totalMembersCount === 1 ? 'member' : 'members'}
          </span>
        </div>
      </div>

      {/* 3. Main Content / Member List */}
      {loading && members.length === 0 ? (
        <div className="py-16">
          <LoadingState message="Loading members directory..." />
        </div>
      ) : hasNoMembersEver ? (
        /* Empty State: No members in gym yet */
        <div className="p-10 sm:p-14 rounded-2xl bg-white border border-neutral-200/80 text-center shadow-2xs flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-600 flex items-center justify-center mb-3">
            <Users className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-neutral-950">
            Add your first member
          </h2>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm">
            Keep all your gym payments in one place.
          </p>
          <div className="mt-5">
            <Button
              size="md"
              onClick={onAddMember}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Member
            </Button>
          </div>
        </div>
      ) : hasNoSearchResults ? (
        /* Search Empty State: Filter or Query returned 0 results */
        <div className="p-10 sm:p-14 rounded-2xl bg-white border border-neutral-200/80 text-center shadow-2xs flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-500 flex items-center justify-center mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-neutral-950">
            No members found.
          </h2>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm">
            {searchInput ? `No matches for "${searchInput}".` : 'No members found with the selected filter.'} Try a different search.
          </p>
          <div className="mt-4 flex items-center gap-2">
            {searchInput && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearSearch}
              >
                Clear Search
              </Button>
            )}
            {activeFilter !== 'ALL' && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleFilterChange('ALL')}
              >
                Reset Filter to All
              </Button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Table View (Hidden on Mobile) */}
          <div className="hidden md:block bg-white rounded-2xl border border-neutral-200/80 shadow-2xs overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/50 text-[11px] font-bold uppercase tracking-wider text-neutral-400 select-none">
                  <th scope="col" className="py-3 px-5">Member</th>
                  <th scope="col" className="py-3 px-4">Membership</th>
                  <th scope="col" className="py-3 px-4">Payment</th>
                  <th scope="col" className="py-3 px-4">Next Payment</th>
                  <th scope="col" className="py-3 px-4 text-right">Amount</th>
                  <th scope="col" className="py-3 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs">
                {paginatedMembers.map((member) => {
                  const status = member.calculatedStatus || PAYMENT_STATUS.PAID;
                  const isPending =
                    status === PAYMENT_STATUS.OVERDUE ||
                    status === PAYMENT_STATUS.DUE_TODAY ||
                    status === PAYMENT_STATUS.DUE_SOON;
                  const displayName = member.name || 'Member';
                  const displayPhone = member.phone || 'No phone';
                  const displayPlan = member.planName || 'Monthly Standard';
                  const displayFee = Number(member.monthlyFee) || 0;

                  return (
                    <tr
                      key={member.id}
                      id={`member-row-${member.id}`}
                      className="hover:bg-neutral-50/70 transition-colors group"
                    >
                      {/* Column 1: Member (Avatar + Name + Phone) */}
                      <td className="py-3 px-5">
                        <div
                          className="flex items-center gap-3 cursor-pointer"
                          onClick={() => onSelectMember(member)}
                          title="View member details"
                        >
                          <Avatar name={displayName} size="sm" />
                          <div className="min-w-0 max-w-[200px] lg:max-w-[260px]">
                            <span className="font-semibold text-neutral-900 text-sm block truncate group-hover:text-neutral-700 transition-colors">
                              {displayName}
                            </span>
                            <span className="text-neutral-400 text-xs flex items-center gap-1 font-mono">
                              <Phone className="w-3 h-3 text-neutral-300" />
                              {displayPhone}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Membership (Plan name & interval) */}
                      <td className="py-3 px-4 text-neutral-600">
                        <span className="font-medium text-neutral-900 block truncate max-w-[140px]">
                          {displayPlan}
                        </span>
                        <span className="text-[10px] text-neutral-400">
                          {member.durationMonths || 1} {member.durationMonths === 1 ? 'Month' : 'Months'}
                        </span>
                      </td>

                      {/* Column 3: Payment (Status Badge) */}
                      <td className="py-3 px-4">
                        <StatusBadge status={status} size="sm" />
                      </td>

                      {/* Column 4: Next Payment */}
                      <td className="py-3 px-4">
                        {renderNextPaymentTag(member)}
                      </td>

                      {/* Column 5: Amount */}
                      <td className="py-3 px-4 text-right">
                        <span className="font-bold text-neutral-950 text-sm block">
                          {formatCurrency(displayFee, currencySymbol)}
                        </span>
                        <span className="text-[10px] text-neutral-400">
                          /renewal
                        </span>
                      </td>

                      {/* Column 6: Action (View, Mark Paid, Remind) */}
                      <td className="py-3 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            id={`btn-view-${member.id}`}
                            onClick={() => onSelectMember(member)}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 transition-colors cursor-pointer"
                            title="View member profile"
                          >
                            View
                          </button>

                          {isPending && (
                            <button
                              type="button"
                              id={`btn-remind-${member.id}`}
                              onClick={() => onSendReminder(member)}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 transition-colors flex items-center gap-1 cursor-pointer"
                              title="Send reminder"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-neutral-500" />
                              <span>Remind</span>
                            </button>
                          )}

                          <button
                            type="button"
                            id={`btn-markpaid-${member.id}`}
                            onClick={() => onQuickPay(member)}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                            title="Record payment"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Mark Paid</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View (Hidden on Desktop) */}
          <div className="md:hidden space-y-2.5">
            {paginatedMembers.map((member) => {
              const status = member.calculatedStatus || PAYMENT_STATUS.PAID;
              const isPending =
                status === PAYMENT_STATUS.OVERDUE ||
                status === PAYMENT_STATUS.DUE_TODAY ||
                status === PAYMENT_STATUS.DUE_SOON;
              const displayName = member.name || 'Member';
              const displayPhone = member.phone || 'No phone';
              const displayFee = Number(member.monthlyFee) || 0;

              return (
                <div
                  key={member.id}
                  id={`member-card-${member.id}`}
                  className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-3"
                >
                  {/* Top Row: Avatar + Name + Status Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                      onClick={() => onSelectMember(member)}
                    >
                      <Avatar name={displayName} size="md" />
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-sm text-neutral-950 block truncate">
                          {displayName}
                        </span>
                        <span className="text-xs text-neutral-400 flex items-center gap-1 font-mono truncate">
                          <Phone className="w-3 h-3 text-neutral-300 shrink-0" />
                          <span className="truncate">{displayPhone}</span>
                        </span>
                      </div>
                    </div>

                    <StatusBadge status={status} size="sm" />
                  </div>

                  {/* Middle Row: Plan & Next Payment & Amount */}
                  <div className="p-2.5 bg-neutral-50/70 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-neutral-400 font-medium block">
                        NEXT PAYMENT
                      </span>
                      {renderNextPaymentTag(member)}
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-neutral-400 font-medium block">
                        AMOUNT
                      </span>
                      <span className="text-sm font-bold text-neutral-950">
                        {formatCurrency(displayFee, currencySymbol)}
                      </span>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="grid grid-cols-3 gap-2 pt-0.5">
                    <Button
                      id={`mob-btn-view-${member.id}`}
                      variant="outline"
                      size="sm"
                      onClick={() => onSelectMember(member)}
                      className="w-full text-xs font-semibold py-2.5"
                    >
                      View
                    </Button>

                    <Button
                      id={`mob-btn-remind-${member.id}`}
                      variant="secondary"
                      size="sm"
                      onClick={() => onSendReminder(member)}
                      className="w-full text-xs font-semibold py-2.5"
                    >
                      Remind
                    </Button>

                    <Button
                      id={`mob-btn-markpaid-${member.id}`}
                      size="sm"
                      onClick={() => onQuickPay(member)}
                      className="w-full text-xs font-semibold py-2.5 bg-neutral-900 text-white hover:bg-neutral-800"
                    >
                      Mark Paid
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls for 100+ Members */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs text-xs">
              <span className="text-neutral-500">
                Showing {((currentPage - 1) * PAGE_SIZE) + 1}–{Math.min(currentPage * PAGE_SIZE, totalMembersCount)} of {totalMembersCount} members
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
                >
                  Previous
                </Button>
                <span className="px-2 font-semibold text-neutral-700">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
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
  );
};
