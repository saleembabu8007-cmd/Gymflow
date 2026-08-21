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
import { StaleDataNotification } from '../components/common/StaleDataNotification';
import { MessageSquare, AlertCircle, Clock, CheckCircle2, RotateCw } from 'lucide-react';
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
  const { summary, attentionList, recentPayments, hasNoMembers, loading, isRefreshing, isStale, error, refetch } = useDashboard(user?.gymId);

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
    return `${timeText}, ${firstName}.`;
  }, [user?.name]);

  const urgentList = useMemo(() => attentionList.filter((m) => getDifferenceInDays(m.nextPaymentDate) <= 0), [attentionList]);
  const upcomingList = useMemo(() => attentionList.filter((m) => getDifferenceInDays(m.nextPaymentDate) > 0), [attentionList]);

  if (error && attentionList.length === 0 && summary.activeMembersCount === 0) {
    return (
      <div className="max-w-2xl mx-auto py-10">
        <ErrorState
          title="Couldn't load today's collection summary"
          message="We couldn't retrieve your gym data from Supabase. Please check your connection and try again."
          onRetry={() => refetch(false)}
          retryLabel="Try again"
        />
      </div>
    );
  }

  const renderMemberRow = (member: Member, isUrgent: boolean) => {
    const diffDays = getDifferenceInDays(member.nextPaymentDate);
    const isOverdue = diffDays < 0;
    const isDueToday = diffDays === 0;
    const displayName = member.name || 'Member';
    const displayFee = Number(member.monthlyFee) || 0;

    return (
      <div
        key={member.id}
        className="py-5 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
      >
        <div className="flex items-center gap-4 min-w-0 flex-1 cursor-pointer" onClick={() => onSelectMember(member)}>
          <Avatar name={displayName} size="md" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-base sm:text-lg text-zinc-950 truncate max-w-[220px] sm:max-w-xs transition-colors hover:text-zinc-700">
                {displayName}
              </span>
              {isOverdue && (
                <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-rose-50 text-rose-700 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Overdue · {Math.abs(diffDays)}d
                </span>
              )}
              {isDueToday && (
                <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-amber-50 text-amber-800 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Due Today
                </span>
              )}
              {!isUrgent && (
                <span className="text-xs font-semibold text-zinc-500">
                  {diffDays === 1 ? 'Due Tomorrow' : `Due in ${diffDays}d`}
                </span>
              )}
            </div>
            <div className="text-sm font-medium text-zinc-500 mt-0.5 truncate">
              {formatCurrency(displayFee, currencySymbol)} • {member.planName || 'Monthly Standard'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={() => onSendReminder(member)}>Remind</Button>
          <Button size="sm" onClick={() => onQuickPay(member)} className="bg-zinc-900 text-white hover:bg-zinc-800">Mark Paid</Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-12 max-w-4xl mx-auto pb-12">
      <StaleDataNotification isStale={isStale} onRetry={() => refetch(true)} isRefreshing={isRefreshing} />

      {/* Dynamic Header */}
      <div className="flex flex-col gap-2 pt-2 sm:pt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">
            {greeting}
          </h1>
          <button
            type="button"
            onClick={() => refetch(false)}
            className="text-zinc-400 hover:text-zinc-700 p-2 -mr-2 rounded-lg hover:bg-zinc-100 transition-colors"
            title="Refresh dashboard"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <Skeleton className="h-6 w-64" />
        ) : (
          <p className="text-lg sm:text-xl font-medium text-zinc-600">
            {urgentList.length > 0 
              ? `You have ${urgentList.length} ${urgentList.length === 1 ? 'member' : 'members'} requiring attention today.`
              : "You're all caught up for today."}
          </p>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : hasNoMembers ? (
        <div className="py-16 text-center border-y border-zinc-100">
          <h3 className="text-lg font-bold text-zinc-950">Welcome to GymFlow</h3>
          <p className="text-zinc-500 mt-2 mb-6">Add your first member to start tracking payments.</p>
          <Button size="md" onClick={onAddMember}>Add Member</Button>
        </div>
      ) : (
        <>
          {/* Urgent Section */}
          {urgentList.length > 0 ? (
            <section aria-labelledby="urgent-heading">
              <h2 id="urgent-heading" className="text-sm font-bold uppercase tracking-wider text-rose-600 border-b border-zinc-100 pb-3">
                Requires Attention
              </h2>
              <div className="flex flex-col">
                {urgentList.map(m => renderMemberRow(m, true))}
              </div>
            </section>
          ) : (
            <div className="py-8 border-y border-zinc-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-950">Zero pending items.</h3>
                <p className="text-zinc-500">All active members are fully paid up.</p>
              </div>
            </div>
          )}

          {/* Coming Up Section */}
          {upcomingList.length > 0 && (
            <section aria-labelledby="upcoming-heading">
              <h2 id="upcoming-heading" className="text-sm font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-100 pb-3 mt-8">
                Coming Up
              </h2>
              <div className="flex flex-col opacity-90">
                {upcomingList.map(m => renderMemberRow(m, false))}
              </div>
            </section>
          )}

          {/* Activity Section */}
          <section aria-labelledby="activity-heading" className="bg-zinc-50/50 p-6 sm:p-8 rounded-3xl border border-zinc-100 mt-12">
            <h2 id="activity-heading" className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-6">
              Today's Activity
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-10">
              <div className="shrink-0">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Collected This Month</span>
                <span className="text-4xl font-extrabold font-mono text-zinc-950 tracking-tight">
                  {formatCurrency(summary.collectedThisMonth, currencySymbol)}
                </span>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block">Recent Payments</span>
                  {onViewAllPayments && (
                    <button onClick={onViewAllPayments} className="text-xs font-semibold text-zinc-600 hover:text-zinc-950">
                      View ledger →
                    </button>
                  )}
                </div>
                
                {recentPayments.length === 0 ? (
                  <p className="text-sm text-zinc-500">No payments collected recently.</p>
                ) : (
                  <div className="space-y-4">
                    {recentPayments.map(p => (
                      <div key={p.id} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-3">
                          <Avatar name={p.memberName || 'M'} size="sm" />
                          <span className="font-semibold text-zinc-900">{p.memberName}</span>
                        </div>
                        <span className="font-mono font-bold text-zinc-950">+{formatCurrency(Number(p.amount) || 0, currencySymbol)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};
