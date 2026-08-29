import React from 'react';
import {
  Building2,
  CheckCircle,
  Clock,
  CreditCard,
  AlertTriangle,
  XCircle,
  Users,
  ArrowRight,
} from 'lucide-react';
import { PlatformStats, PlatformGymTenant } from '../../types';
import { formatCurrency } from '../../utils/currencyUtils';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { InlineSummary } from '../../components/ui/InlineSummary';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Avatar } from '../../components/ui/Avatar';
import { TwoTierNumber } from '../../components/ui/TwoTierNumber';
import { formatDate } from '../../utils/dateUtils';
import { cn } from '../../utils/classNames';

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
    <div className="space-y-6 select-none font-sans max-w-7xl mx-auto">
      {/* Top Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-neutral-950 tracking-tight font-display">
          Platform Overview
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Real-time health across customer gym tenants and active subscriptions
        </p>
      </div>

      {/* Operational Inline Metric Line */}
      <InlineSummary
        metrics={[
          {
            label: 'Total Gyms',
            value: stats?.totalGyms || 0,
            caption: `${activeGymsCount} active`,
            variant: 'default',
          },
          {
            label: 'Active Subscriptions',
            value: stats?.activeSubscriptions || 0,
            caption: `${stats?.pastDueSubscriptions || 0} past due`,
            variant: (stats?.pastDueSubscriptions || 0) > 0 ? 'warning' : 'success',
          },
          {
            label: 'Platform MRR',
            value: formatCurrency(stats?.mrr || 0, '₹'),
            caption: 'recurring revenue',
            variant: 'success',
          },
          {
            label: 'Total Members',
            value: stats?.totalMembers || 0,
            caption: 'across all gyms',
            variant: 'default',
          },
        ]}
      />

      {/* 2-Column Split Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 Cols): Recent Gym Tenants */}
        <div className="lg:col-span-7 space-y-3">
          <SectionHeader
            title="Customer Gyms"
            count={gyms.length}
            subtitle="Latest onboarded tenants"
            action={
              <button
                type="button"
                onClick={onNavigateToGyms}
                className="text-xs font-semibold text-neutral-600 hover:text-neutral-950 flex items-center gap-1 transition-colors cursor-pointer"
              >
                View all <ArrowRight className="w-3 h-3" />
              </button>
            }
          />

          <div className="bg-white border border-neutral-200/80 rounded-[var(--radius-lg)] shadow-2xs divide-y divide-neutral-100 overflow-hidden">
            {gyms.slice(0, 5).map((gym) => (
              <div
                key={gym.id}
                className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-neutral-50/80 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Avatar name={gym.name} size="sm" />
                  <div className="min-w-0">
                    <span className="font-bold text-xs sm:text-sm text-neutral-900 block truncate">
                      {gym.name}
                    </span>
                    <span className="text-[11px] text-neutral-500 font-mono truncate block">
                      {gym.ownerName} · {gym.ownerEmail}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 text-right">
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-neutral-100 text-neutral-700 font-mono">
                    {gym.memberCount} members
                  </span>
                  <StatusBadge status={gym.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE'} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (5 Cols): Platform Health Breakdown */}
        <div className="lg:col-span-5 space-y-3">
          <SectionHeader
            title="Subscription Health"
            subtitle="Current billing status breakdown"
            action={
              <button
                type="button"
                onClick={onNavigateToSubscriptions}
                className="text-xs font-semibold text-neutral-600 hover:text-neutral-950 flex items-center gap-1 transition-colors cursor-pointer"
              >
                Manage <ArrowRight className="w-3 h-3" />
              </button>
            }
          />

          <div className="bg-white border border-neutral-200/80 rounded-[var(--radius-lg)] shadow-2xs divide-y divide-neutral-100 overflow-hidden">
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[var(--color-success-50)] text-[var(--color-success-700)] flex items-center justify-center">
                  <CheckCircle className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-semibold text-neutral-800">Active Paid Subscriptions</span>
              </div>
              <span className="text-xs font-bold text-neutral-900 font-mono">
                {stats?.activeSubscriptions || 0}
              </span>
            </div>

            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[var(--color-warning-50)] text-[var(--color-warning-700)] flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-semibold text-neutral-800">Past Due Invoices</span>
              </div>
              <span className="text-xs font-bold text-[var(--color-warning-700)] font-mono">
                {stats?.pastDueSubscriptions || 0}
              </span>
            </div>

            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[var(--color-danger-50)] text-[var(--color-danger-700)] flex items-center justify-center">
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-semibold text-neutral-800">Suspended Gym Accounts</span>
              </div>
              <span className="text-xs font-bold text-[var(--color-danger-700)] font-mono">
                {stats?.suspendedGyms || 0}
              </span>
            </div>

            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-neutral-100 text-neutral-500 flex items-center justify-center">
                  <XCircle className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-semibold text-neutral-800">Cancelled Plans</span>
              </div>
              <span className="text-xs font-bold text-neutral-500 font-mono">
                {stats?.cancelledSubscriptions || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
