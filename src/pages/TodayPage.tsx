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
import { MemberRow } from '../components/ui/MemberRow';
import { MetricCard } from '../components/ui/MetricCard';
import { StaleDataNotification } from '../components/common/StaleDataNotification';
import { CheckCircle2, RotateCw } from 'lucide-react';
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



  return (
    <div className="space-y-12 max-w-4xl mx-auto pb-12">
      <StaleDataNotification isStale={isStale} onRetry={() => refetch(true)} isRefreshing={isRefreshing} />

      {/* Dynamic Header */}
      <div className="flex flex-col gap-4 pt-2 sm:pt-6 border-b border-slate-100 pb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {greeting}
          </h1>
          <button
            type="button"
            onClick={() => refetch(false)}
            className="text-slate-400 hover:text-slate-700 p-2 -mr-2 rounded-lg hover:bg-slate-100 transition-colors"
            title="Refresh dashboard"
          >
            <RotateCw className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <Skeleton className="h-6 w-64" />
        ) : (
          <p className="text-[17px] font-medium text-slate-500">
            {urgentList.length > 0 
              ? `You have ${urgentList.length} ${urgentList.length === 1 ? 'member' : 'members'} requiring attention today.`
              : "You're all caught up for today. Great job."}
          </p>
        )}

        {/* Quick Glance Strip */}
        {!loading && !error && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mt-2">
            <div className="bg-slate-50 border border-slate-100 rounded-[16px] p-4 flex flex-col">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Active Members</span>
              <span className="text-2xl font-extrabold text-slate-900">{summary.activeMembersCount}</span>
            </div>
            <div className={cn("border rounded-[16px] p-4 flex flex-col", urgentList.length > 0 ? "bg-rose-50 border-rose-100" : "bg-slate-50 border-slate-100")}>
              <span className={cn("text-[11px] font-bold uppercase tracking-widest mb-1", urgentList.length > 0 ? "text-rose-500" : "text-slate-400")}>Overdue</span>
              <span className={cn("text-2xl font-extrabold", urgentList.length > 0 ? "text-rose-600" : "text-slate-900")}>{urgentList.length}</span>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 rounded-[16px] p-4 flex flex-col hidden sm:flex">
              <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Collected</span>
              <span className="text-2xl font-extrabold text-emerald-700">{formatCurrency(summary.collectedThisMonth, currencySymbol)}</span>
            </div>
          </div>
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
            <section aria-labelledby="urgent-heading" className="bg-rose-50/50 p-4 sm:p-6 rounded-3xl border border-rose-100 mt-2 shadow-[inset_0_1px_4px_rgba(244,63,94,0.05)]">
              <div className="flex items-center justify-between mb-5">
                <h2 id="urgent-heading" className="text-[13px] font-bold uppercase tracking-wider text-rose-600">
                  Requires Attention
                </h2>
                <div className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
              </div>
              <div className="flex flex-col gap-2">
                {urgentList.map(m => (
                  <MemberRow 
                    key={m.id} 
                    member={m} 
                    currencySymbol={currencySymbol} 
                    onSelect={onSelectMember} 
                    onRemind={onSendReminder} 
                    onQuickPay={onQuickPay}
                    highlighted={false}
                  />
                ))}
              </div>
            </section>
          ) : (
            <div className="py-8 border-y border-slate-100 flex items-center gap-4 mt-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Zero pending items.</h3>
                <p className="text-[15px] font-medium text-slate-500">All active members are fully paid up.</p>
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
                {upcomingList.map(m => (
                  <MemberRow 
                    key={m.id} 
                    member={m} 
                    currencySymbol={currencySymbol} 
                    onSelect={onSelectMember} 
                    onRemind={onSendReminder} 
                    onQuickPay={onQuickPay}
                    className="mb-2 last:mb-0"
                  />
                ))}
              </div>
            </section>
          )}

          {/* Activity Section */}
          <section aria-labelledby="activity-heading" className="bg-slate-50/50 p-6 sm:p-8 rounded-3xl border border-slate-100 mt-12">
            <h2 id="activity-heading" className="text-[13px] font-bold uppercase tracking-wider text-slate-400 mb-6">
              Today's Activity
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-10">
              <div className="w-full sm:w-[340px] shrink-0">
                <MetricCard
                  title="Collected This Month"
                  progress={{
                    value: 100, // Visual only for now unless we have a real target
                    max: 100,
                    variant: 'brand',
                    label: <span className="text-3xl text-teal-900 -ml-1 font-mono">{formatCurrency(summary.collectedThisMonth, currencySymbol)}</span>
                  }}
                  caption="Total revenue collected so far this month."
                  variant="brand"
                  onAction={onViewAllPayments}
                  actionLabel="View ledger"
                />
              </div>
              
              <div className="flex-1 mt-2 sm:mt-0">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Recent Payments</span>
                  {onViewAllPayments && (
                    <button onClick={onViewAllPayments} className="text-[13px] font-bold text-teal-600 hover:text-teal-700 transition-colors">
                      View ledger →
                    </button>
                  )}
                </div>
                
                {recentPayments.length === 0 ? (
                  <p className="text-[15px] font-medium text-slate-500">No payments collected recently.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {recentPayments.map(p => (
                      <div 
                        key={p.id} 
                        className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-100 transition-all hover:shadow-sm"
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <Avatar name={p.memberName || 'M'} size="md" />
                          <div className="flex-1 min-w-0">
                            <span className="font-semibold text-[15px] text-slate-900 truncate block">
                              {p.memberName}
                            </span>
                            <span className="text-[13px] font-medium text-slate-500 mt-0.5 block">
                              Paid {formatDate(p.date, { format: 'short' })}
                            </span>
                          </div>
                        </div>
                        <div className="shrink-0">
                          <span className="font-mono font-bold text-[15px] text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                            +{formatCurrency(Number(p.amount) || 0, currencySymbol)}
                          </span>
                        </div>
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
