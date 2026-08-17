import React from 'react';
import { CreditCard, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';
import { PlatformGymTenant } from '../../types';
import { formatCurrency } from '../../utils/currencyUtils';

interface AdminSubscriptionsPageProps {
  gyms: PlatformGymTenant[];
}

export const AdminSubscriptionsPage: React.FC<AdminSubscriptionsPageProps> = ({ gyms }) => {
  const activeSubs = gyms.filter((g) => g.status === 'ACTIVE');
  const totalMrr = activeSubs.length * 1999;

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">SaaS Subscription Management</h1>
        <p className="text-xs text-neutral-400 mt-0.5">
          Platform billing oversight, subscription statuses, and monthly recurring revenue
        </p>
      </div>

      {/* Plan Card */}
      <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 font-mono text-[11px] font-bold">
              Standard Plan
            </span>
            <span className="text-xs text-neutral-400 font-mono">Single Tier SaaS</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">GymFlow Pro Plan</h2>
          <p className="text-xs text-neutral-400 max-w-lg leading-relaxed">
            Includes complete multi-tenant gym management, member tracking, payment ledgers, automated WhatsApp reminders, and audit logging.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-right shrink-0">
          <span className="text-[10px] text-neutral-400 uppercase font-bold block">Monthly Fee</span>
          <span className="text-2xl font-extrabold text-emerald-400 font-mono">₹1,999 / mo</span>
          <span className="text-[10px] text-neutral-500 block mt-0.5">Total Estimated MRR: {formatCurrency(totalMrr, '₹')}</span>
        </div>
      </div>

      {/* Tenant Subscriptions Ledger */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-bold text-white">Tenant Subscription Statuses</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="bg-neutral-950 text-neutral-400 uppercase font-semibold border-b border-neutral-800">
              <tr>
                <th className="px-4 py-3">Customer Gym</th>
                <th className="px-4 py-3">SaaS Plan</th>
                <th className="px-4 py-3">Billing Status</th>
                <th className="px-4 py-3">Monthly Rate</th>
                <th className="px-4 py-3 text-right">Renewal Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {gyms.map((gym) => (
                <tr key={gym.id} className="hover:bg-neutral-800/40 transition-colors">
                  <td className="px-4 py-3.5 font-bold text-white">
                    <div>{gym.name}</div>
                    <div className="text-[10px] text-neutral-500 font-mono font-normal">
                      {gym.ownerEmail}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-semibold text-neutral-200">{gym.subscriptionPlan}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        gym.status === 'ACTIVE'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {gym.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-mono font-bold text-white">₹1,999</td>
                  <td className="px-4 py-3.5 font-mono text-neutral-400 text-right">
                    {gym.renewalDate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
