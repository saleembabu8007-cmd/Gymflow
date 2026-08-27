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
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

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
    <div className="space-y-4 font-sans max-w-7xl">
      {/* Top Operational Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Platform Operational Overview</h1>
        <p className="text-[length:var(--text-caption-size)] text-neutral-500 mt-1">
          Real-time metrics across all customer gym tenants and billing subscriptions
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Gyms */}
        <Card className="p-4 flex flex-col justify-center">
          <div className="text-[length:var(--text-caption-size)] text-neutral-500 font-medium mb-1">Total Customer Gyms</div>
          <div className="text-[length:var(--text-heading-size)] font-mono font-bold text-neutral-900">{stats?.totalGyms || 0}</div>
          <div className="text-[10px] text-[var(--color-success-600)] mt-1 font-mono font-medium">
            {activeGymsCount} active accounts
          </div>
        </Card>

        {/* Active Subscriptions */}
        <Card className="p-4 flex flex-col justify-center">
          <div className="text-[length:var(--text-caption-size)] text-neutral-500 font-medium mb-1">Active Subscriptions</div>
          <div className="text-[length:var(--text-heading-size)] font-mono font-bold text-[var(--color-success-600)]">
            {stats?.activeSubscriptions || 0}
          </div>
          <div className="text-[10px] text-neutral-500 mt-1 font-mono font-medium">
            {stats?.pastDueSubscriptions || 0} past due
          </div>
        </Card>

        {/* Estimated MRR */}
        <Card className="p-4 flex flex-col justify-center">
          <div className="text-[length:var(--text-caption-size)] text-neutral-500 font-medium mb-1">Estimated MRR</div>
          <div className="text-[length:var(--text-heading-size)] font-mono font-bold text-[var(--color-success-600)]">
            {formatCurrency(stats?.mrr || 0, '₹')}
          </div>
          <div className="text-[10px] text-neutral-500 mt-1 font-mono font-medium">
            Recurring subscription revenue
          </div>
        </Card>

        {/* Total Members Across Tenants */}
        <Card className="p-4 flex flex-col justify-center">
          <div className="text-[length:var(--text-caption-size)] text-neutral-500 font-medium mb-1">Total Members (Platform)</div>
          <div className="text-[length:var(--text-heading-size)] font-mono font-bold text-neutral-900">{stats?.totalMembers || 0}</div>
          <div className="text-[10px] text-neutral-500 mt-1 font-mono font-medium">
            Across all customer gyms
          </div>
        </Card>
      </div>

      {/* Secondary Status Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-[var(--radius-lg)] bg-[var(--color-warning-50)] text-[var(--color-warning-600)] border border-[var(--color-warning-200)] flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[length:var(--text-caption-size)] text-neutral-500 font-medium">Pending Dues (Tenants)</div>
            <div className="text-lg font-mono font-bold text-neutral-900">{stats?.pendingPayments || 0} member dues</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-[var(--radius-lg)] bg-[var(--color-danger-50)] text-[var(--color-danger-600)] border border-[var(--color-danger-200)] flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[length:var(--text-caption-size)] text-neutral-500 font-medium">Suspended Accounts</div>
            <div className="text-lg font-mono font-bold text-[var(--color-danger-600)]">{stats?.suspendedGyms || 0} gyms</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-[var(--radius-lg)] bg-neutral-100 text-neutral-600 border border-neutral-200 flex items-center justify-center shrink-0">
            <XCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[length:var(--text-caption-size)] text-neutral-500 font-medium">Cancelled Subscriptions</div>
            <div className="text-lg font-mono font-bold text-neutral-500">{stats?.cancelledSubscriptions || 0} cancelled</div>
          </div>
        </Card>
      </div>

      {/* Recent Gym Tenants Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b border-neutral-100 pb-4">
          <div className="space-y-0.5">
            <CardTitle>Recent Gym Tenants</CardTitle>
            <CardDescription>Latest customer gym onboarding activity</CardDescription>
          </div>
          <button
            type="button"
            onClick={onNavigateToGyms}
            className="text-[length:var(--text-caption-size)] font-semibold text-[var(--color-brand-600)] hover:text-[var(--color-brand-700)] flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>View All</span>
          </button>
        </CardHeader>

        <CardContent className="p-0">
          <div className="divide-y divide-neutral-100 overflow-hidden">
            {gyms.slice(0, 5).map((gym) => (
              <div key={gym.id} className="p-4 flex items-center justify-between gap-4 hover:bg-neutral-50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-[var(--radius-lg)] bg-neutral-100 text-neutral-600 flex items-center justify-center shrink-0 font-bold text-xs border border-neutral-200">
                    {gym.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-[length:var(--text-body-size)] text-neutral-900 block truncate">{gym.name}</span>
                    <span className="text-[length:var(--text-caption-size)] text-neutral-500 truncate block font-mono">
                      Owner: {gym.ownerName} ({gym.ownerEmail})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs shrink-0">
                  <Badge variant="neutral">
                    {gym.memberCount} Members
                  </Badge>
                  {gym.status === 'ACTIVE' ? (
                    <Badge variant="success" icon={<CheckCircle className="w-3 h-3" />}>ACTIVE</Badge>
                  ) : (
                    <Badge variant="danger" icon={<XCircle className="w-3 h-3" />}>SUSPENDED</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
