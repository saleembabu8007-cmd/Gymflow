import React from 'react';
import { CreditCard, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';
import { PlatformGymTenant } from '../../types';
import { formatCurrency } from '../../utils/currencyUtils';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

interface AdminSubscriptionsPageProps {
  gyms: PlatformGymTenant[];
}

export const AdminSubscriptionsPage: React.FC<AdminSubscriptionsPageProps> = ({ gyms }) => {
  const activeSubs = gyms.filter((g) => g.status === 'ACTIVE');
  const totalMrr = activeSubs.length * 1999;

  return (
    <div className="space-y-4 font-sans max-w-7xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-neutral-900 tracking-tight">SaaS Subscription Management</h1>
        <p className="text-[length:var(--text-caption-size)] text-neutral-500 mt-0.5">
          Platform billing oversight, subscription statuses, and monthly recurring revenue
        </p>
      </div>

      {/* Plan Card */}
      <Card className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="success">Standard Plan</Badge>
            <span className="text-[length:var(--text-caption-size)] text-neutral-500 font-mono">Single Tier SaaS</span>
          </div>
          <h2 className="text-[length:var(--text-subtitle-size)] font-bold text-neutral-900">GymFlow Pro Plan</h2>
          <p className="text-[length:var(--text-caption-size)] text-neutral-500 max-w-lg leading-relaxed mt-1">
            Includes complete multi-tenant gym management, member tracking, payment ledgers, automated WhatsApp reminders, and audit logging.
          </p>
        </div>

        <div className="md:py-4 md:text-right shrink-0">
          <span className="text-[10px] text-neutral-500 uppercase font-bold block mb-1">Monthly Fee</span>
          <span className="text-[length:var(--text-heading-size)] font-bold text-[var(--color-success-600)] font-mono">₹1,999 / mo</span>
          <span className="text-[10px] text-neutral-500 block mt-1 font-mono font-medium">Total Estimated MRR: {formatCurrency(totalMrr, '₹')}</span>
        </div>
      </Card>

      {/* Tenant Subscriptions Ledger */}
      <div>
        <h3 className="text-[length:var(--text-body-size)] font-bold text-neutral-900 mb-3">Tenant Subscription Statuses</h3>

        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-[length:var(--text-body-size)] text-neutral-700">
              <thead className="text-[length:var(--text-caption-size)] text-neutral-500 font-semibold border-b border-neutral-200 bg-neutral-50/50">
                <tr>
                  <th className="px-4 py-3">Customer Gym</th>
                  <th className="px-4 py-3">SaaS Plan</th>
                  <th className="px-4 py-3">Billing Status</th>
                  <th className="px-4 py-3">Monthly Rate</th>
                  <th className="px-4 py-3 text-right">Renewal Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {gyms.map((gym) => (
                  <tr key={gym.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-neutral-900">
                      <div>{gym.name}</div>
                      <div className="text-[10px] text-neutral-500 font-mono font-normal">
                        {gym.ownerEmail}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-neutral-800">{gym.subscriptionPlan}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      {gym.status === 'ACTIVE' ? (
                        <Badge variant="success" icon={<CheckCircle2 className="w-3 h-3" />}>PRO ACTIVE</Badge>
                      ) : (
                        <Badge variant="danger">SUSPENDED</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold text-neutral-900">₹1,999</td>
                    <td className="px-4 py-3.5 font-mono text-neutral-500 text-[length:var(--text-caption-size)] text-right">
                      {gym.renewalDate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
