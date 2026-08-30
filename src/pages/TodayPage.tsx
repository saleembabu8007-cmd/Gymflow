import React, { useMemo } from 'react';
import { Button } from '../components/ui/Button';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';
import { ListSectionSkeleton } from '../components/ui/Skeleton';
import { Member } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useDashboard } from '../hooks/useDashboard';
import { useDelayedLoading } from '../hooks/useDelayedLoading';
import { useGymSettings } from '../hooks/useGymSettings';
import { formatCurrency } from '../utils/currencyUtils';
import { formatDate, getDifferenceInDays } from '../utils/dateUtils';
import { MemberRow } from '../components/ui/MemberRow';
import { SectionHeader } from '../components/ui/SectionHeader';
import { StaleDataNotification } from '../components/common/StaleDataNotification';
import { cn } from '../utils/classNames';
import {
  CheckCircle2,
  RotateCw,
  Users,
  Calendar,
  ArrowRight,
  UserPlus,
  CreditCard,
  Bell,
  CalendarCheck,
  Activity,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';

interface TodayPageProps {
  onQuickPay: (member: Member) => void;
  onSendReminder: (member: Member) => void;
  onAddMember: () => void;
  onSelectMember: (member: Member) => void;
  onOpenRecordPayment?: () => void;
  onViewAllPayments?: () => void;
  onViewAllMembers?: () => void;
  onNavigateSettings?: () => void;
  onNavigateReminders?: () => void;
}

export const TodayPage: React.FC<TodayPageProps> = ({
  onQuickPay,
  onSendReminder,
  onAddMember,
  onSelectMember,
  onOpenRecordPayment,
  onViewAllPayments,
  onViewAllMembers,
  onNavigateReminders,
}) => {
  const { user } = useAuth();
  const { currencySymbol } = useGymSettings();
  const {
    summary,
    attentionList,
    recentPayments,
    hasNoMembers,
    loading,
    isRefreshing,
    isStale,
    error,
    refetch,
  } = useDashboard(user?.gymId);
  const showLoading = useDelayedLoading(loading, 300);

  // Segment attention lists by urgency
  const overdueList = useMemo(
    () => attentionList.filter((m) => getDifferenceInDays(m.nextPaymentDate) < 0),
    [attentionList]
  );
  const dueTodayList = useMemo(
    () => attentionList.filter((m) => getDifferenceInDays(m.nextPaymentDate) === 0),
    [attentionList]
  );
  const upcomingList = useMemo(
    () => attentionList.filter((m) => getDifferenceInDays(m.nextPaymentDate) > 0),
    [attentionList]
  );

  // Combined urgent collection queue (Overdue + Due Today)
  const urgentQueue = useMemo(
    () => [...overdueList, ...dueTodayList],
    [overdueList, dueTodayList]
  );

  // Error State Handling
  if (error && attentionList.length === 0 && summary.activeMembersCount === 0) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <ErrorState
          title="Couldn't load today's dashboard"
          message="We were unable to retrieve your gym's collection data. Please verify your internet connection and try again."
          onRetry={() => refetch(false)}
          retryLabel="Retry"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none font-sans max-w-7xl mx-auto">
      <StaleDataNotification
        isStale={isStale}
        onRetry={() => refetch(true)}
        isRefreshing={isRefreshing}
      />

      {/* ========================================================================= */}
      {/* 1. TOP HEADER: DATE & REFRESH                                             */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-950 tracking-tight font-display">
            Today
          </h1>
          <p className="text-xs text-neutral-500 font-mono mt-0.5">
            {formatDate(new Date().toISOString(), { format: 'medium' })}
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetch(false)}
          aria-label="Refresh dashboard data"
          className="w-9 h-9 rounded-full flex items-center justify-center text-neutral-500 hover:text-neutral-950 hover:bg-neutral-100 transition-colors border border-neutral-200/80 cursor-pointer shadow-2xs"
          title="Refresh Data"
        >
          <RotateCw className={cn('w-4 h-4', isRefreshing && 'animate-spin')} />
        </button>
      </div>

      {showLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-6">
            <ListSectionSkeleton itemsCount={3} />
            <ListSectionSkeleton itemsCount={2} />
          </div>
          <div className="lg:col-span-5 space-y-6">
            <ListSectionSkeleton itemsCount={4} />
          </div>
        </div>
      ) : hasNoMembers ? (
        /* Empty State: Zero Members in Gym */
        <EmptyState
          icon={<Users className="w-8 h-8 stroke-[1.5]" />}
          title="Welcome to GymFlow"
          description="Your operational dashboard will show members who need payment attention, upcoming renewals, and collection activity once you add your first member."
          actionLabel="Add Your First Member"
          onAction={onAddMember}
          className="py-16 bg-white border border-neutral-200/80 rounded-[var(--radius-lg)] shadow-2xs"
        />
      ) : (
        <div className="space-y-6">
          {/* ========================================================================= */}
          {/* 2. REFINED OPERATIONAL SCORECARD STRIP                                    */}
          {/* ========================================================================= */}
          <div className="bg-white border border-neutral-200/80 rounded-[var(--radius-lg)] shadow-2xs divide-y sm:divide-y-0 sm:divide-x divide-neutral-100 grid grid-cols-2 lg:grid-cols-4 overflow-hidden">
            {/* Card 1: Active Members */}
            <div className="p-4 sm:p-5 flex flex-col justify-between hover:bg-neutral-50/50 transition-colors">
              <div className="flex items-center justify-between text-[11px] font-mono font-bold text-neutral-500 uppercase tracking-wider mb-2">
                <span>Active Members</span>
                <Users className="w-3.5 h-3.5 text-neutral-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold font-display text-neutral-950 tabular-nums">
                  {summary.activeMembersCount}
                </span>
                <span className="text-xs text-neutral-500 font-medium">enrolled</span>
              </div>
              <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-neutral-500 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success-500)]" />
                <span>Healthy member base</span>
              </div>
            </div>

            {/* Card 2: Overdue */}
            <div className="p-4 sm:p-5 flex flex-col justify-between hover:bg-neutral-50/50 transition-colors">
              <div className="flex items-center justify-between text-[11px] font-mono font-bold text-neutral-500 uppercase tracking-wider mb-2">
                <span>Overdue</span>
                <AlertTriangle className={cn('w-3.5 h-3.5', overdueList.length > 0 ? 'text-[var(--color-danger-500)]' : 'text-neutral-400')} />
              </div>
              <div className="flex items-baseline gap-2">
                <span
                  className={cn(
                    'text-2xl sm:text-3xl font-extrabold font-display tabular-nums',
                    overdueList.length > 0 ? 'text-[var(--color-danger-600)]' : 'text-neutral-950'
                  )}
                >
                  {overdueList.length}
                </span>
                <span className="text-xs text-neutral-500 font-medium">
                  {overdueList.length === 1 ? 'member' : 'members'}
                </span>
              </div>
              <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-medium">
                {overdueList.length > 0 ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-danger-500)] animate-pulse" />
                    <span className="text-[var(--color-danger-700)] font-semibold">Requires follow-up</span>
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success-500)]" />
                    <span className="text-[var(--color-success-700)]">Zero overdue dues</span>
                  </>
                )}
              </div>
            </div>

            {/* Card 3: Due Today */}
            <div className="p-4 sm:p-5 flex flex-col justify-between hover:bg-neutral-50/50 transition-colors">
              <div className="flex items-center justify-between text-[11px] font-mono font-bold text-neutral-500 uppercase tracking-wider mb-2">
                <span>Due Today</span>
                <Clock className={cn('w-3.5 h-3.5', dueTodayList.length > 0 ? 'text-[var(--color-warning-500)]' : 'text-neutral-400')} />
              </div>
              <div className="flex items-baseline gap-2">
                <span
                  className={cn(
                    'text-2xl sm:text-3xl font-extrabold font-display tabular-nums',
                    dueTodayList.length > 0 ? 'text-[var(--color-warning-700)]' : 'text-neutral-950'
                  )}
                >
                  {dueTodayList.length}
                </span>
                <span className="text-xs text-neutral-500 font-medium">
                  {dueTodayList.length === 1 ? 'member' : 'members'}
                </span>
              </div>
              <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-medium">
                {dueTodayList.length > 0 ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-warning-500)]" />
                    <span className="text-[var(--color-warning-800)] font-semibold">Renewal due today</span>
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
                    <span className="text-neutral-500">None due today</span>
                  </>
                )}
              </div>
            </div>

            {/* Card 4: Collected This Month */}
            <div className="p-4 sm:p-5 flex flex-col justify-between hover:bg-neutral-50/50 transition-colors">
              <div className="flex items-center justify-between text-[11px] font-mono font-bold text-neutral-500 uppercase tracking-wider mb-2">
                <span>Collected (Month)</span>
                <TrendingUp className="w-3.5 h-3.5 text-[var(--color-success-600)]" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-extrabold font-display text-[var(--color-success-700)] tabular-nums">
                  {formatCurrency(summary.collectedThisMonth, currencySymbol)}
                </span>
              </div>
              <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-neutral-500 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success-500)]" />
                <span>Recorded collections</span>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 3. 12-COLUMN MAIN OPERATIONAL GRID                                        */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Hero Column (7 Cols): Needs Attention & Upcoming */}
            <div className="lg:col-span-7 space-y-6">
              {/* 1. Needs Your Attention Section (HERO) */}
              <section aria-labelledby="needs-attention-heading" className="space-y-3">
                <SectionHeader
                  title="Needs Your Attention"
                  count={urgentQueue.length}
                  subtitle="Overdue & due today"
                  action={
                    onViewAllMembers && urgentQueue.length > 0 ? (
                      <button
                        type="button"
                        onClick={onViewAllMembers}
                        className="text-xs font-semibold text-neutral-600 hover:text-neutral-950 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        View all <ArrowRight className="w-3 h-3" />
                      </button>
                    ) : undefined
                  }
                />

                {urgentQueue.length === 0 ? (
                  <div className="p-6 text-center border border-neutral-200/80 rounded-[var(--radius-lg)] bg-white shadow-2xs flex flex-col items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-[var(--color-success-50)] text-[var(--color-success-600)] flex items-center justify-center mb-2.5 border border-[var(--color-success-200)] shadow-2xs">
                      <CheckCircle2 className="w-5 h-5 stroke-[2]" />
                    </div>
                    <h3 className="text-sm font-bold text-neutral-900 font-display">
                      You're all caught up
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto leading-relaxed">
                      Every active member is currently paid up. No immediate payment action or follow-up is required today.
                    </p>
                  </div>
                ) : (
                  <div className="bg-white border border-neutral-200/80 rounded-[var(--radius-lg)] shadow-2xs divide-y divide-neutral-100 overflow-hidden">
                    {urgentQueue.slice(0, 4).map((member) => (
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

              {/* 2. Upcoming Renewals Section (Next 7 Days) */}
              <section aria-labelledby="upcoming-renewals-heading" className="space-y-3">
                <SectionHeader
                  title="Upcoming Renewals"
                  count={upcomingList.length}
                  subtitle="Next 7 days"
                />

                {upcomingList.length === 0 ? (
                  <div className="p-5 text-center border border-neutral-200/80 rounded-[var(--radius-lg)] bg-white shadow-2xs">
                    <CalendarCheck className="w-5 h-5 text-neutral-400 mx-auto mb-1.5 stroke-[1.5]" />
                    <p className="text-xs text-neutral-500">
                      No memberships due for renewal in the next 7 days.
                    </p>
                  </div>
                ) : (
                  <div className="bg-white border border-neutral-200/80 rounded-[var(--radius-lg)] shadow-2xs divide-y divide-neutral-100 overflow-hidden">
                    {upcomingList.slice(0, 4).map((member) => (
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
            </div>

            {/* Right Supporting Column (5 Cols): Quick Actions & Activity Feed */}
            <div className="lg:col-span-5 space-y-6">
              {/* Quick Actions (3-Up Command Tiles) */}
              <section aria-labelledby="quick-actions-heading" className="space-y-3">
                <SectionHeader
                  title="Quick Actions"
                  subtitle="Daily owner workflows"
                />

                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={onAddMember}
                    className="p-3 bg-white border border-neutral-200/80 rounded-[var(--radius-lg)] shadow-2xs hover:bg-neutral-50/80 transition-all flex flex-col items-center justify-center text-center group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-[var(--color-brand-100)] text-neutral-950 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                      <UserPlus className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-neutral-900 leading-tight block">
                      Add Member
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={onOpenRecordPayment}
                    className="p-3 bg-white border border-neutral-200/80 rounded-[var(--radius-lg)] shadow-2xs hover:bg-neutral-50/80 transition-all flex flex-col items-center justify-center text-center group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-900 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-neutral-900 leading-tight block">
                      Record Pay
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={onNavigateReminders}
                    className="p-3 bg-white border border-neutral-200/80 rounded-[var(--radius-lg)] shadow-2xs hover:bg-neutral-50/80 transition-all flex flex-col items-center justify-center text-center group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-900 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                      <Bell className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-neutral-900 leading-tight block">
                      Remind
                    </span>
                  </button>
                </div>
              </section>

              {/* Recent Activity Feed (Ledger Audit) */}
              <section aria-labelledby="recent-activity-heading" className="space-y-3">
                <div className="flex items-center justify-between">
                  <SectionHeader
                    title="Recent Activity"
                    subtitle="Latest recorded payments"
                  />
                  {onViewAllPayments && recentPayments.length > 0 && (
                    <button
                      type="button"
                      onClick={onViewAllPayments}
                      className="text-xs font-semibold text-neutral-600 hover:text-neutral-950 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      View all <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {recentPayments.length === 0 ? (
                  <div className="p-6 text-center border border-neutral-200/80 rounded-[var(--radius-lg)] bg-white shadow-2xs">
                    <Activity className="w-5 h-5 text-neutral-400 mx-auto mb-1.5 stroke-[1.5]" />
                    <p className="text-xs text-neutral-500">
                      No payment activity recorded this month.
                    </p>
                  </div>
                ) : (
                  <div className="bg-white border border-neutral-200/80 rounded-[var(--radius-lg)] shadow-2xs divide-y divide-neutral-100 overflow-hidden">
                    {recentPayments.slice(0, 5).map((payment) => (
                      <div
                        key={payment.id}
                        className="p-3.5 flex items-center justify-between gap-3 hover:bg-neutral-50/60 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-7 h-7 rounded-full bg-neutral-100 text-neutral-800 flex items-center justify-center font-bold text-[11px] font-mono shrink-0 border border-neutral-200/80">
                            {payment.memberName.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-xs text-neutral-900 block truncate">
                              {payment.memberName}
                            </span>
                            <span className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider block">
                              {payment.paymentMethod}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-bold text-[var(--color-success-700)] font-mono block">
                            +{formatCurrency(payment.amount, currencySymbol)}
                          </span>
                          <span className="text-[10px] text-neutral-400 font-mono">
                            {formatDate(payment.paymentDate, { format: 'short' })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
