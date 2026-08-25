import React, { useMemo } from 'react';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { ErrorState } from '../components/ui/ErrorState';
import { Skeleton, StatCardSkeleton, ListSectionSkeleton } from '../components/ui/Skeleton';
import { Member } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useDashboard } from '../hooks/useDashboard';
import { useDelayedLoading } from '../hooks/useDelayedLoading';
import { motion } from 'motion/react';
import { useGymSettings } from '../hooks/useGymSettings';
import { formatCurrency } from '../utils/currencyUtils';
import { formatDate, getDifferenceInDays } from '../utils/dateUtils';
import { MemberRow } from '../components/ui/MemberRow';
import { StatCard } from '../components/ui/StatCard';
import { StaleDataNotification } from '../components/common/StaleDataNotification';
import { cn } from '../utils/classNames';
import { 
  CheckCircle2, 
  RotateCw, 
  Wallet, 
  Users, 
  Calendar, 
  AlertCircle, 
  ArrowRight,
  UserPlus,
  CreditCard,
  Bell,
  Lightbulb,
  UserCheck,
  Clock,
  MoreVertical,
  CalendarCheck,
  Activity
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
  onNavigateSettings,
  onNavigateReminders,
}) => {
  const { user } = useAuth();
  const { currencySymbol } = useGymSettings();
  const { summary, attentionList, recentPayments, hasNoMembers, loading, isRefreshing, isStale, error, refetch } = useDashboard(user?.gymId);
  const showLoading = useDelayedLoading(loading, 400);

  const urgentList = useMemo(() => attentionList.filter((m) => getDifferenceInDays(m.nextPaymentDate) <= 0), [attentionList]);
  const upcomingList = useMemo(() => attentionList.filter((m) => getDifferenceInDays(m.nextPaymentDate) > 0), [attentionList]);
  const dueTodayList = useMemo(() => attentionList.filter((m) => getDifferenceInDays(m.nextPaymentDate) === 0), [attentionList]);

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
    <div className="space-y-6 max-w-[1440px] mx-auto pb-12">
      <StaleDataNotification isStale={isStale} onRetry={() => refetch(true)} isRefreshing={isRefreshing} />

      {/* Top Controls Strip */}
      <div className="flex items-center justify-end pb-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl shadow-sm text-[13px] font-bold text-slate-700">
            <Calendar className="w-4 h-4 text-slate-400" />
            {formatDate(new Date().toISOString(), { format: 'medium' })}
          </div>
          <button
            type="button"
            onClick={() => refetch(false)}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
            title="Refresh dashboard"
          >
            <RotateCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
          </button>
        </div>
      </div>

      {showLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-6">
              <ListSectionSkeleton itemsCount={2} />
              <ListSectionSkeleton itemsCount={1} />
            </div>
            <div className="lg:col-span-5 space-y-6">
              <ListSectionSkeleton itemsCount={4} />
            </div>
          </div>
        </div>
      ) : hasNoMembers ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
          className="py-20 text-center flex flex-col items-center justify-center max-w-md mx-auto"
        >
          <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 mb-6">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome to GymFlow</h3>
          <p className="text-[15px] font-medium text-slate-600 mt-3 mb-8 leading-relaxed">
            Your dashboard will come alive once you add your first member. Start tracking payments, sending WhatsApp reminders, and managing your gym effortlessly.
          </p>
          <Button size="lg" variant="secondary" onClick={onAddMember} className="px-8 shadow-sm">
            Add Your First Member
          </Button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
          className="space-y-6"
        >
          {/* Main Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Active Members"
              value={summary.activeMembersCount}
              icon={<UserCheck />}
              caption="All active members"
              variant="success"
              actionLabel="View members"
              onAction={onViewAllMembers}
            />
            <StatCard
              title="Overdue Members"
              value={urgentList.length}
              icon={<Clock />}
              caption="Require immediate attention"
              variant="danger"
              actionLabel="View overdue"
              onAction={onViewAllMembers}
            />
            <StatCard
              title="Due Today"
              value={dueTodayList.length}
              icon={<Calendar />}
              caption="Payments due today"
              variant="warning"
              actionLabel="View today's dues"
              onAction={onViewAllMembers}
            />
            <StatCard
              title="Collected This Month"
              value={formatCurrency(summary.collectedThisMonth, currencySymbol)}
              icon={<Wallet />}
              caption="Total payments collected"
              variant="success"
              onAction={onViewAllPayments}
              actionLabel="View ledger"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Needs Your Attention */}
              <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-5 sm:p-6 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-[15px] font-bold text-slate-900 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-500" />
                      Needs Your Attention
                    </h2>
                    <div className="flex items-center gap-2">
                      {urgentList.length > 0 && (
                        <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold flex items-center justify-center">
                          {urgentList.length}
                        </span>
                      )}
                      <button className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-[13px] text-slate-500 font-medium">Members who need your immediate attention</p>
                </div>
                
                {urgentList.length > 0 ? (
                  <div className="px-5 sm:px-6 pb-6">
                    <div className="border border-rose-200 rounded-[20px] bg-rose-50/30 overflow-hidden">
                      <div className="flex flex-col">
                        {urgentList.slice(0, 3).map((m, i) => (
                          <div key={m.id} className={cn("p-1", i > 0 && "border-t border-rose-100/50")}>
                            <MemberRow 
                              member={m} 
                              currencySymbol={currencySymbol} 
                              onSelect={onSelectMember} 
                              onRemind={onSendReminder} 
                              onQuickPay={onQuickPay}
                              highlighted={false}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    <button 
                      onClick={onViewAllMembers}
                      className="mt-5 text-[13px] font-bold text-teal-700 flex items-center gap-1.5 group transition-colors hover:text-teal-800"
                    >
                      View all overdue members <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                ) : (
                  <div className="px-5 sm:px-6 pb-6 flex items-center justify-center pt-4">
                     <div className="text-[14px] font-medium text-slate-500 py-8 text-center border border-dashed border-slate-200 rounded-[20px] bg-slate-50/50 w-full">
                      All caught up! No overdue members.
                    </div>
                  </div>
                )}
              </div>

              {/* Upcoming Renewals */}
              <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-5 sm:p-6 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-[15px] font-bold text-slate-900 flex items-center gap-2">
                      <CalendarCheck className="w-4 h-4 text-emerald-600" />
                      Upcoming Renewals
                    </h2>
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold flex items-center justify-center">
                      {upcomingList.length}
                    </span>
                  </div>
                </div>

                <div className="px-5 sm:px-6 pb-6">
                  {upcomingList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center border border-slate-100 rounded-[20px] bg-slate-50/50">
                      <CalendarCheck className="w-8 h-8 text-slate-300 mb-3" />
                      <h4 className="text-[14px] font-bold text-slate-900">No upcoming renewals</h4>
                      <p className="text-[13px] text-slate-500 mt-1 max-w-[200px]">There are no memberships due for renewal in the next 7 days.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {upcomingList.slice(0, 3).map(m => (
                        <div key={m.id} className="border border-slate-100 rounded-[20px] bg-slate-50/50 p-1">
                          <MemberRow 
                            member={m} 
                            currencySymbol={currencySymbol} 
                            onSelect={onSelectMember}
                            onQuickPay={onQuickPay}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Right Column */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Quick Actions */}
              <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-5 sm:p-6">
                <h2 className="text-[15px] font-bold text-slate-900 mb-5">Quick Actions</h2>
                <div className="flex flex-col gap-3">
                  
                  <button onClick={onAddMember} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-all text-left group">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                      <UserPlus className="w-4 h-4 text-teal-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="block text-[14px] font-bold text-slate-900">Add Member</span>
                      <span className="block text-[12px] text-slate-500 truncate">Add a new member to your gym</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
                  </button>

                  {onOpenRecordPayment && (
                    <button onClick={onOpenRecordPayment} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-all text-left group">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                        <CreditCard className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="block text-[14px] font-bold text-slate-900">Record Payment</span>
                        <span className="block text-[12px] text-slate-500 truncate">Record a payment for a member</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  )}

                  <button onClick={onNavigateReminders} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-all text-left group">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                      <Bell className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="block text-[14px] font-bold text-slate-900">Send Reminder</span>
                      <span className="block text-[12px] text-slate-500 truncate">Send payment reminders</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
                  </button>

                  <button onClick={onViewAllMembers} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-all text-left group">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="block text-[14px] font-bold text-slate-900">View Members</span>
                      <span className="block text-[12px] text-slate-500 truncate">Browse all your members</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
                  </button>

                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-5 sm:p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-[15px] font-bold text-slate-900 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-600" />
                    Recent Activity
                  </h2>
                  {onViewAllPayments && (
                    <button onClick={onViewAllPayments} className="text-[12px] font-bold text-teal-700 hover:text-teal-800 transition-colors flex items-center gap-1 group">
                      View all activity <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  )}
                </div>
                
                <p className="text-[12px] text-slate-500 mb-4 font-medium uppercase tracking-wider">Recent Payments</p>
                
                {recentPayments.length === 0 ? (
                  <p className="text-[13px] font-medium text-slate-500 border border-dashed border-slate-200 rounded-[16px] p-6 text-center">No payments collected recently.</p>
                ) : (
                  <div className="flex flex-col gap-1">
                    {recentPayments.slice(0, 4).map(p => (
                      <div key={p.id} className="flex items-center justify-between gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar name={p.memberName || 'M'} size="sm" />
                          <div className="min-w-0">
                            <span className="font-bold text-[13px] text-slate-900 truncate block">
                              {p.memberName}
                            </span>
                            <span className="text-[11px] font-medium text-slate-500 mt-0.5 block">
                              Paid {formatDate(p.paymentDate, { format: 'short' })}
                            </span>
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <span className="font-display tracking-tight font-bold text-[14px] text-emerald-700 block">
                            +{formatCurrency(Number(p.amount) || 0, currencySymbol)}
                          </span>
                          <span className="text-[10px] font-medium text-slate-400 capitalize">{p.paymentMethod.toLowerCase()}</span>
                        </div>
                      </div>
                    ))}

                    {onViewAllPayments && recentPayments.length > 0 && (
                      <button onClick={onViewAllPayments} className="mt-2 text-[12px] font-bold text-teal-700 hover:text-teal-800 transition-colors flex items-center gap-1 group">
                        View all payments <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Pro Tip Footer */}
          <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-[20px] bg-emerald-50 border border-emerald-100/60">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <Lightbulb className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-[13px] text-emerald-900 font-medium leading-relaxed">
                <strong className="font-bold mr-1">Pro Tip:</strong> 
                Set up automated reminders to save time. You can customize reminder days in Settings.
              </p>
            </div>
            <Button variant="tertiary" size="sm" onClick={onNavigateSettings} className="shrink-0 bg-white hover:bg-emerald-100 border-emerald-200 text-emerald-800 self-stretch sm:self-auto">
              Go to Settings
            </Button>
          </div>

        </motion.div>
      )}
    </div>
  );
};
