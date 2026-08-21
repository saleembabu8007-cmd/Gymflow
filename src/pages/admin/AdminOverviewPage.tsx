import React from 'react';
import {
  Building2,
  CheckCircle,
  Clock,
  CreditCard,
  AlertTriangle,
  XCircle,
  Users,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { PlatformStats, PlatformGymTenant } from '../../types';
import { formatCurrency } from '../../utils/currencyUtils';

interface AdminOverviewPageProps {
  stats: PlatformStats | null;
  gyms: PlatformGymTenant[];
  onNavigateToGyms: () => void;
  onNavigateToSubscriptions: () => void;
}

export const AdminOverviewPage: React.FC<AdminOverviewPageProps> = ({
  stats,
  gyms,
  onNavigateToGyms,
  onNavigateToSubscriptions,
}) => {
  const activeGymsCount = stats?.activeGyms ?? stats?.totalGyms ?? 0;

  return (
    <div className="space-y-8 font-sans">
      {/* Top Operational Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Platform Operational Overview</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Real-time metrics across all customer gym tenants and billing subscriptions
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-y border-zinc-800 sm:border-y-0 sm:border-x">
        {/* Total Gyms */}
        <div className="py-6 sm:px-6 border-b sm:border-b-0 sm:border-r border-zinc-800 flex flex-col justify-center">
          <div className="text-xs text-zinc-400 font-medium mb-1">Total Customer Gyms</div>
          <div className="text-2xl font-mono font-extrabold text-white">{stats?.totalGyms || 0}</div>
          <div className="text-[10px] text-emerald-400 mt-1 font-mono">
            {activeGymsCount} active accounts
          </div>
        </div>

        {/* Active Subscriptions */}
        <div className="py-6 sm:px-6 border-b sm:border-b-0 lg:border-r border-zinc-800 flex flex-col justify-center">
          <div className="text-xs text-zinc-400 font-medium mb-1">Active Subscriptions</div>
          <div className="text-2xl font-mono font-extrabold text-emerald-400">
            {stats?.activeSubscriptions || 0}
          </div>
          <div className="text-[10px] text-zinc-400 mt-1 font-mono">
            {stats?.pastDueSubscriptions || 0} past due
          </div>
        </div>

        {/* Estimated MRR */}
        <div className="py-6 sm:px-6 border-b sm:border-b-0 sm:border-r border-zinc-800 flex flex-col justify-center">
          <div className="text-xs text-zinc-400 font-medium mb-1">Estimated MRR</div>
          <div className="text-2xl font-mono font-extrabold text-white">
            {formatCurrency(stats?.mrr || 0, '₹')}
          </div>
          <div className="text-[10px] text-rose-400 mt-1 font-mono">
            Recurring subscription revenue
          </div>
        </div>

        {/* Total Members Across Tenants */}
        <div className="py-6 sm:px-6 flex flex-col justify-center">
          <div className="text-xs text-zinc-400 font-medium mb-1">Total Members (Platform)</div>
          <div className="text-2xl font-mono font-extrabold text-white">{stats?.totalMembers || 0}</div>
          <div className="text-[10px] text-zinc-400 mt-1 font-mono">
            Across all customer gyms
          </div>
        </div>
      </div>

      {/* Secondary Status Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 border-y border-zinc-800 sm:border-y-0 sm:border-x">
        <div className="py-4 sm:px-6 border-b sm:border-b-0 sm:border-r border-zinc-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-zinc-400 font-medium">Pending Dues (Tenants)</div>
            <div className="text-lg font-mono font-bold text-white">{stats?.pendingPayments || 0} member dues</div>
          </div>
        </div>

        <div className="py-4 sm:px-6 border-b sm:border-b-0 sm:border-r border-zinc-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-zinc-400 font-medium">Suspended Accounts</div>
            <div className="text-lg font-mono font-bold text-rose-400">{stats?.suspendedGyms || 0} gyms</div>
          </div>
        </div>

        <div className="py-4 sm:px-6 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-zinc-800 text-zinc-400 border border-zinc-700 flex items-center justify-center shrink-0">
            <XCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-zinc-400 font-medium">Cancelled Subscriptions</div>
            <div className="text-lg font-mono font-bold text-zinc-300">{stats?.cancelledSubscriptions || 0} cancelled</div>
          </div>
        </div>
      </div>

      {/* Recent Gym Tenants Overview */}
      <div className="pt-4 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-white">Recent Gym Tenants</h2>
            <p className="text-xs text-zinc-400">Latest customer gym onboarding activity</p>
          </div>
          <button
            type="button"
            onClick={onNavigateToGyms}
            className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>View All Customer Gyms</span>
          </button>
        </div>

        <div className="divide-y divide-zinc-800/60 overflow-hidden">
          {gyms.slice(0, 5).map((gym) => (
            <div key={gym.id} className="py-3.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-zinc-800 text-zinc-300 flex items-center justify-center shrink-0 font-bold text-xs">
                  {gym.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-sm text-white block truncate">{gym.name}</span>
                  <span className="text-xs text-zinc-400 truncate block font-mono">
                    Owner: {gym.ownerName} ({gym.ownerEmail})
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs shrink-0">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {gym.memberCount} Members
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    gym.status === 'ACTIVE'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {gym.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
