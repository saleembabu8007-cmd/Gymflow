import React, { useState, useMemo, useEffect } from 'react';
import { Member } from '../types';
import { useMembers } from '../hooks/useMembers';
import { useDelayedLoading } from '../hooks/useDelayedLoading';
import { useGymSettings } from '../hooks/useGymSettings';
import { MemberRow } from '../components/ui/MemberRow';
import { SearchInput } from '../components/ui/SearchInput';
import { FilterChips, FilterChipOption } from '../components/ui/FilterChips';
import { SectionHeader } from '../components/ui/SectionHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { MemberRowSkeleton } from '../components/ui/Skeleton';
import { LoadMore } from '../components/ui/LoadMore';
import { StaleDataNotification } from '../components/common/StaleDataNotification';
import { 
  Users, 
  Search, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  RotateCw 
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
  const { 
    members, 
    loading, 
    isRefreshing, 
    isStale, 
    error, 
    setFilter, 
    fetchMembers, 
    counts 
  } = useMembers();
  const showLoading = useDelayedLoading(loading, 300);
  const { currencySymbol } = useGymSettings();

  const [activeFilter, setActiveFilter] = useState<FilterStatus>('ALL');
  const [searchInput, setSearchInput] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [recentPaymentId, setRecentPaymentId] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Listen for local quick payment completions to flash success row state
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

  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    setCurrentPage(1);
    setFilter((prev) => ({ ...prev, search: val }));
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setCurrentPage(1);
    setFilter((prev) => ({ ...prev, search: '' }));
  };

  const handleFilterChange = (status: FilterStatus) => {
    setActiveFilter(status);
    setCurrentPage(1);
    setFilter((prev) => ({ ...prev, status }));
  };

  const filterTabs: FilterChipOption<FilterStatus>[] = [
    { id: 'ALL', label: 'All', count: counts.ALL },
    { id: 'ACTIVE', label: 'Active', badgeVariant: 'success', count: counts.ACTIVE },
    { id: 'PENDING', label: 'Overdue / Due', badgeVariant: 'danger', count: counts.PENDING },
    { id: 'DUE_SOON', label: 'Due Soon', badgeVariant: 'warning', count: counts.DUE_SOON },
    { id: 'EXPIRED', label: 'Expired', badgeVariant: 'neutral', count: counts.EXPIRED },
  ];

  const totalMembersCount = members.length;
  const paginatedMembers = members.slice(0, currentPage * PAGE_SIZE);
  const hasMore = currentPage * PAGE_SIZE < totalMembersCount;

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setCurrentPage((p) => p + 1);
      setIsLoadingMore(false);
    }, 300);
  };

  const isFiltering = searchInput.trim().length > 0 || activeFilter !== 'ALL';
  const hasNoMembersEver = !loading && members.length === 0 && !isFiltering;
  const hasNoSearchResults = !loading && members.length === 0 && isFiltering;

  // Full error state
  if (error && members.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <ErrorState
          title="Couldn't load members list"
          message="We were unable to retrieve your gym members directory. Please check your connection and try again."
          onRetry={fetchMembers}
          retryLabel="Try again"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none font-sans max-w-7xl mx-auto">
      <StaleDataNotification 
        isStale={isStale} 
        onRetry={() => fetchMembers(true)} 
        isRefreshing={isRefreshing} 
      />

      {/* Top Section: Search Bar + Filter Tabs */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Field */}
          <div className="w-full sm:max-w-xs">
            <SearchInput
              value={searchInput}
              onSearchChange={handleSearchChange}
              placeholder="Search name or phone..."
            />
          </div>

          {/* Refresh Button */}
          <div className="flex items-center justify-between sm:justify-end gap-2">
            <span className="text-xs text-neutral-500 font-medium">
              {totalMembersCount} {totalMembersCount === 1 ? 'member' : 'members'} found
            </span>
            <button
              type="button"
              onClick={() => fetchMembers(false)}
              aria-label="Refresh member directory"
              className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-500 hover:text-neutral-950 hover:bg-neutral-100 transition-colors border border-neutral-200/80 cursor-pointer shadow-2xs"
              title="Refresh"
            >
              <RotateCw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin")} />
            </button>
          </div>
        </div>

        {/* Filter Chip Strip */}
        <div className="overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          <FilterChips<FilterStatus>
            options={filterTabs}
            activeId={activeFilter}
            onChange={handleFilterChange}
          />
        </div>
      </div>

      {/* Main List Body */}
      {showLoading && members.length === 0 ? (
        <div className="bg-white border border-neutral-200/80 rounded-[var(--radius-lg)] shadow-2xs divide-y divide-neutral-100 overflow-hidden">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <MemberRowSkeleton key={i} />
          ))}
        </div>
      ) : hasNoMembersEver ? (
        /* Empty State: Zero Members */
        <EmptyState
          icon={<Users className="w-8 h-8 stroke-[1.5]" />}
          title="Add your first member"
          description="Start tracking member renewals, collecting fees, and sending WhatsApp reminders from one clean place."
          actionLabel="Add Member"
          onAction={onAddMember}
          className="py-16 bg-white border border-neutral-200/80 shadow-2xs"
        />
      ) : hasNoSearchResults ? (
        /* Empty State: Search or Filter Yielded No Results */
        <EmptyState
          icon={<Search className="w-8 h-8 stroke-[1.5]" />}
          title="No members found"
          description={
            searchInput
              ? `No members found matching "${searchInput}".`
              : `No members currently match the "${activeFilter.toLowerCase()}" filter.`
          }
          actionLabel={searchInput ? 'Clear Search' : 'View All Members'}
          onAction={searchInput ? handleClearSearch : () => handleFilterChange('ALL')}
          className="py-16 bg-white border border-neutral-200/80 shadow-2xs"
        />
      ) : (
        /* Populated Member Directory */
        <div className="space-y-4">
          <div className="bg-white border border-neutral-200/80 rounded-[var(--radius-lg)] shadow-2xs divide-y divide-neutral-100 overflow-hidden">
            {paginatedMembers.map((member) => (
              <MemberRow
                key={member.id}
                member={member}
                currencySymbol={currencySymbol}
                onSelect={onSelectMember}
                onRemind={onSendReminder}
                onQuickPay={onQuickPay}
                highlighted={recentPaymentId === member.id}
              />
            ))}
          </div>

          {/* Load More Pagination */}
          {hasMore && (
            <div className="pt-2 flex justify-center">
              <LoadMore
                onLoadMore={handleLoadMore}
                isLoading={isLoadingMore}
                hasMore={hasMore}
              />
            </div>
          )}
        </div>
      )}

      {/* Mobile Sticky Quick Add FAB */}
      <div className="fixed bottom-20 right-4 sm:hidden z-30">
        <button
          type="button"
          onClick={onAddMember}
          aria-label="Add Member"
          className="flex items-center justify-center w-12 h-12 bg-[var(--color-brand-500)] text-neutral-950 rounded-full shadow-lg active:scale-95 transition-transform cursor-pointer font-bold"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
