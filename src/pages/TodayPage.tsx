import React, { useMemo } from 'react';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { ErrorState } from '../components/ui/ErrorState';
import { Skeleton } from '../components/ui/Skeleton';
import { Member } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useDashboard } from '../hooks/useDashboard';
import { useGymSettings } from '../hooks/useGymSettings';
import { formatCurrency } from '../utils/currencyUtils';
import { formatDate, getDifferenceInDays } from '../utils/dateUtils';
import {
  Plus,
  CreditCard,
  MessageSquare,
  CheckCircle2,
  ArrowRight,
  Clock,
  AlertCircle,
  Users,
  Check,
  RotateCw,
} from 'lucide-react';
import { cn } from '../utils/classNames';

interface TodayPageProps {
  onQuickPay: (member: Member) => void;
  onSendReminder: (member: Member) => void;
  onAddMember: () => void;
  onSelectMember: (member: Member) => void;
  onOpenRecordPayment?: () => void;
  onViewAllPayments?: () => void;
}

export const TodayPage: React.FC<TodayPageProps> = ({
  onQuickPay,
  onSendReminder,
  onAddMember,
  onSelectMember,
  onOpenRecordPayment,
  onViewAllPayments,
}) => {
  const { user } = useAuth();
  const { currencySymbol } = useGymSettings();
  const {
    summary,
    attentionList,
    recentPayments,
    hasNoMembers,
    loading,
    error,
    refetch,
  } = useDashboard(user?.gymId);

  // Dynamic time-of-day greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    let timeText = 'Good morning';
    if (hour >= 12 && hour < 17) {
      timeText = 'Good afternoon';
    } else if (hour >= 17 || hour < 4) {
      timeText = 'Good evening';
    }
    const firstName = user?.name ? user.name.split(' ')[0] : 'Owner';
    return `${timeText}, ${firstName}`;
  }, [user?.name]);

  const handleRecordPaymentClick = () => {
    if (onOpenRecordPayment) {
      onOpenRecordPayment();
    } else if (attentionList.length > 0) {
      onQuickPay(attentionList[0]);
    } else {
      onAddMember();
    }
  };

  // 1. Error State with Retry
  if (error && attentionList.length === 0 && summary.activeMembersCount === 0) {
    return (
      <div className="max-w-2xl mx-auto py-10">
        <ErrorState
          title="Couldn't load today's collection summary"
          message="We couldn't retrieve your gym data from Supabase. Please check your connection and try again."
          onRetry={refetch}
          retryLabel="Try again"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 max-w-5xl mx-auto">
      {/* 1. Primary Header with First Question */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200/70 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-950 tracking-tight">
            Who needs my attention today?
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            {greeting} • Real-time collection & renewal ledger
          </p>
        </div>

        {/* Primary Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            id="today-quick-record-payment"
            variant="outline"
            size="md"
            onClick={handleRecordPaymentClick}
            disabled={hasNoMembers}
            leftIcon={<CreditCard className="w-4 h-4 text-neutral-700" />}
          >
            Record Payment
          </Button>

          <Button
            id="today-quick-add-member"
            size="md"
            onClick={onAddMember}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Member
          </Button>
        </div>
      </div>

      {/* 2. Four Summary Metrics Cards (Real DB Aggregations / Skeletons) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Pending Summary */}
        <div className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
            Pending
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            {loading ? (
              <Skeleton className="h-7 w-12" />
            ) : (
              <span
                className={cn(
                  'text-xl sm:text-2xl font-bold tracking-tight',
                  summary.pendingCount > 0 ? 'text-rose-600' : 'text-neutral-950'
                )}
              >
                {summary.pendingCount}
              </span>
            )}
            <span className="text-xs text-neutral-500 font-medium">members</span>
          </div>
          <p className="text-[10px] text-neutral-400 mt-0.5">Overdue & Due Today</p>
        </div>

        {/* Due Soon Summary */}
        <div className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
            Due Soon
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            {loading ? (
              <Skeleton className="h-7 w-12" />
            ) : (
              <span
                className={cn(
                  'text-xl sm:text-2xl font-bold tracking-tight',
                  summary.dueSoonCount > 0 ? 'text-amber-600' : 'text-neutral-950'
                )}
              >
                {summary.dueSoonCount}
              </span>
            )}
            <span className="text-xs text-neutral-500 font-medium">members</span>
          </div>
          <p className="text-[10px] text-neutral-400 mt-0.5">Next 3 days</p>
        </div>

        {/* Collected This Month Summary */}
        <div className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
            Collected
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            {loading ? (
              <Skeleton className="h-7 w-24" />
            ) : (
              <span className="text-xl sm:text-2xl font-bold text-neutral-950 tracking-tight truncate">
                {formatCurrency(summary.collectedThisMonth, currencySymbol)}
              </span>
            )}
          </div>
          <p className="text-[10px] text-neutral-400 mt-0.5">This month</p>
        </div>

        {/* Active Members Summary */}
        <div className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
            Active Members
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            {loading ? (
              <Skeleton className="h-7 w-12" />
            ) : (
              <span className="text-xl sm:text-2xl font-bold text-neutral-950 tracking-tight">
                {summary.activeMembersCount}
              </span>
            )}
            <span className="text-xs text-neutral-500 font-medium">total</span>
          </div>
          <p className="text-[10px] text-neutral-400 mt-0.5">Enrolled</p>
        </div>
      </div>

      {/* 3. Most Important Section: Prioritized Needs Attention List */}
      <section aria-labelledby="needs-attention-heading" className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2
              id="needs-attention-heading"
              className="text-base sm:text-lg font-bold text-neutral-950 tracking-tight"
            >
              Needs Attention
            </h2>
            {attentionList.length > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-100 text-rose-700">
                {attentionList.length}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={refetch}
            className="text-xs text-neutral-400 hover:text-neutral-700 inline-flex items-center gap-1 transition-colors cursor-pointer"
            title="Refresh dashboard"
          >
            <RotateCw className="w-3 h-3" />
            <span>Refresh</span>
          </button>
        </div>

        {loading ? (
          /* Loading Skeletons */
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 rounded-2xl bg-white border border-neutral-200/80 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-8 w-28 rounded-xl" />
              </div>
            ))}
          </div>
        ) : hasNoMembers ? (
          /* Empty State: Zero members in gym */
          <div className="p-8 sm:p-12 rounded-2xl bg-white border border-neutral-200/80 text-center shadow-2xs flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-600 flex items-center justify-center mb-3">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-neutral-950">
              No members yet
            </h3>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-sm">
              Add your first member to start tracking payments, renewals, and WhatsApp reminders.
            </p>
            <div className="mt-4">
              <Button
                id="btn-today-empty-add-member"
                size="md"
                onClick={onAddMember}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Add Member
              </Button>
            </div>
          </div>
        ) : attentionList.length === 0 ? (
          /* Positive, Calm Empty State: All settled */
          <div className="p-8 sm:p-10 rounded-2xl bg-white border border-neutral-200/80 text-center shadow-2xs flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900">
              You're all caught up.
            </h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm">
              No payments need your attention today. All memberships are currently in good standing.
            </p>
          </div>
        ) : (
          /* Prioritized Attention Member Rows (Overdue -> Due Today -> Due Soon) */
          <div className="space-y-2">
            {attentionList.map((member) => {
              const diffDays = getDifferenceInDays(member.nextPaymentDate);
              const isOverdue = diffDays < 0;
              const isDueToday = diffDays === 0;
              const displayName = member.name || 'Member';
              const displayPlan = member.planName || 'Monthly Standard';
              const displayFee = Number(member.monthlyFee) || 0;

              return (
                <div
                  key={member.id}
                  id={`attention-row-${member.id}`}
                  className={cn(
                    'p-3.5 sm:p-4 rounded-2xl bg-white border transition-all duration-150 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 group',
                    isOverdue
                      ? 'border-rose-200/90 hover:border-rose-300'
                      : isDueToday
                      ? 'border-amber-200/90 hover:border-amber-300'
                      : 'border-neutral-200/80 hover:border-neutral-300'
                  )}
                >
                  {/* Left: Avatar + Name + Urgency Badge */}
                  <div
                    className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                    onClick={() => onSelectMember(member)}
                    title="View member details"
                  >
                    <Avatar name={displayName} size="md" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm sm:text-base text-neutral-950 truncate hover:text-neutral-700 transition-colors max-w-[220px] sm:max-w-xs">
                          {displayName}
                        </span>

                        {/* Scan-First Status Pill */}
                        {isOverdue && (
                          <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-rose-50 text-rose-700 border border-rose-200/70 inline-flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 text-rose-600" />
                            <span>
                              Overdue · {Math.abs(diffDays)}{' '}
                              {Math.abs(diffDays) === 1 ? 'day' : 'days'}
                            </span>
                          </span>
                        )}

                        {isDueToday && (
                          <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-amber-50 text-amber-800 border border-amber-200/70 inline-flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Due Today</span>
                          </span>
                        )}

                        {!isOverdue && !isDueToday && (
                          <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200/70 inline-flex items-center gap-1">
                            <span>
                              {diffDays === 1 ? 'Due Tomorrow' : `Due in ${diffDays} days`}
                            </span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-neutral-500 mt-0.5 truncate">
                        <span className="truncate max-w-[140px]">{displayPlan}</span>
                        <span>•</span>
                        <span>Due {formatDate(member.nextPaymentDate, { format: 'short' })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Fee Amount + 1-Click Action Buttons */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100 shrink-0">
                    <div className="text-left sm:text-right pr-1">
                      <span className="text-base sm:text-lg font-bold text-neutral-950 block leading-tight">
                        {formatCurrency(displayFee, currencySymbol)}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-medium">Renewal fee</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        id={`btn-remind-${member.id}`}
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSendReminder(member);
                        }}
                        leftIcon={<MessageSquare className="w-3.5 h-3.5 text-neutral-600" />}
                        className="touch-manipulation"
                      >
                        Remind
                      </Button>

                      <Button
                        id={`btn-mark-paid-${member.id}`}
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuickPay(member);
                        }}
                        leftIcon={<Check className="w-3.5 h-3.5" />}
                        className="touch-manipulation font-semibold bg-neutral-900 hover:bg-neutral-800 text-white"
                      >
                        Mark Paid
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. Recent Payments List */}
      <section aria-labelledby="recent-payments-heading" className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2
            id="recent-payments-heading"
            className="text-base sm:text-lg font-bold text-neutral-950 tracking-tight"
          >
            Recent Payments
          </h2>

          {onViewAllPayments && (
            <button
              type="button"
              id="btn-view-all-payments"
              onClick={onViewAllPayments}
              className="text-xs font-semibold text-neutral-600 hover:text-neutral-950 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>View all payments</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {recentPayments.length === 0 ? (
          <div className="p-6 rounded-2xl bg-white border border-neutral-200/80 text-center text-xs text-neutral-500 shadow-2xs">
            No payments recorded yet this month.
          </div>
        ) : (
          <div className="rounded-2xl bg-white border border-neutral-200/80 shadow-2xs divide-y divide-neutral-100 overflow-hidden">
            {recentPayments.map((payment) => {
              const paymentMemberName = payment.memberName || 'Member';
              const paymentAmt = Number(payment.amount) || 0;

              return (
                <div
                  key={payment.id}
                  className="p-3 sm:p-3.5 flex items-center justify-between gap-3 hover:bg-neutral-50/70 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar name={paymentMemberName} size="sm" />
                    <div className="min-w-0">
                      <span className="font-semibold text-xs sm:text-sm text-neutral-900 truncate block max-w-[180px] sm:max-w-xs">
                        {paymentMemberName}
                      </span>
                      <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                        <span>{formatDate(payment.paymentDate, { format: 'short' })}</span>
                        <span>•</span>
                        <span className="font-medium text-neutral-600">
                          {payment.paymentMethod === 'BANK_TRANSFER' ? 'Bank' : payment.paymentMethod || 'Cash'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex items-center gap-2.5">
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-emerald-700 block">
                        +{formatCurrency(paymentAmt, currencySymbol)}
                      </span>
                      <span className="text-[10px] text-neutral-400">Received</span>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70 hidden sm:inline-block">
                      Paid
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

