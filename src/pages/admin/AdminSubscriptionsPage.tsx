import React from 'react';
import { CreditCard, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { PlatformGymTenant } from '../../types';
import { formatCurrency } from '../../utils/currencyUtils';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { InlineSummary } from '../../components/ui/InlineSummary';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Avatar } from '../../components/ui/Avatar';
import { TwoTierNumber } from '../../components/ui/TwoTierNumber';

interface AdminSubscriptionsPageProps {
  gyms: PlatformGymTenant[];
}

export const AdminSubscriptionsPage: React.FC<AdminSubscriptionsPageProps> = ({ gyms }) => {
  const activeSubs = gyms.filter((g) => g.status === 'ACTIVE');
  const totalMrr = activeSubs.length * 1999;

  return (
    <div className="space-y-6 select-none font-sans max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-neutral-950 tracking-tight font-display">
          SaaS Subscriptions
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Platform billing oversight, recurring subscription tiers, and renewal health
        </p>
      </div>

      {/* Subscription Metrics Line */}
      <InlineSummary
        metrics={[
          {
            label: 'Total Tenants',
            value: gyms.length,
            caption: 'registered gyms',
            variant: 'default',
          },
          {
            label: 'Active Paid',
            value: activeSubs.length,
            caption: 'current licenses',
            variant: 'success',
          },
          {
            label: 'Estimated MRR',
            value: formatCurrency(totalMrr, '₹'),
            caption: 'recurring revenue',
            variant: 'success',
          },
          {
            label: 'Standard Plan',
            value: '₹1,999',
            caption: 'per gym / mo',
            variant: 'default',
          },
        ]}
      />

      {/* Tenant Subscriptions List */}
      <div className="space-y-3">
        <SectionHeader
          title="Tenant Subscriptions"
          count={gyms.length}
          subtitle="Real-time billing tier status across all clubs"
        />

        <div className="bg-white border border-neutral-200/80 rounded-[var(--radius-lg)] shadow-2xs divide-y divide-neutral-100 overflow-hidden">
          {gyms.map((gym) => (
            <div
              key={gym.id}
              className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-50/80 transition-colors"
            >
              {/* Gym info */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Avatar name={gym.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-xs sm:text-sm text-neutral-900 truncate">
                      {gym.name}
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-neutral-100 text-neutral-700">
                      {gym.subscriptionPlan || 'Pro Plan'}
                    </span>
                    <StatusBadge status={gym.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE'} />
                  </div>
                  <span className="text-[11px] text-neutral-500 font-mono block truncate mt-0.5">
                    {gym.ownerName} · {gym.ownerEmail}
                  </span>
                </div>
              </div>

              {/* Fee & Renewal */}
              <div className="flex items-center gap-4 shrink-0 self-end sm:self-center">
                <TwoTierNumber
                  value="₹1,999"
                  caption={`renews ${gym.renewalDate || 'monthly'}`}
                  size="sm"
                  align="right"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
