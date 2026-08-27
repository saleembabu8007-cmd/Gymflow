import React, { useState } from 'react';
import { ShieldCheck, Calendar, CreditCard, CheckCircle2, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { useSubscription } from '../hooks/useSubscription';
import { useServices } from '../services/provider';
import { formatCurrency } from '../utils/currencyUtils';
import { BILLING_CONFIG } from '../lib/domain/subscriptionDomain';

export const SubscriptionPage: React.FC = () => {
  const { user } = useAuth();
  const { subscription: subService } = useServices();
  const { subscription, plan, status, loading, refresh } = useSubscription(user?.gymId);

  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState<string | null>(null);

  const handleInitiatePayment = async () => {
    if (!user?.gymId) return;
    setProcessing(true);
    setPaymentError(null);
    setPaymentSuccessMsg(null);

    try {
      await subService.createCheckoutSession(user.gymId);
      const result = await subService.triggerPaymentVerification(user.gymId, true);

      if (result.success) {
        setPaymentSuccessMsg(result.message);
        await refresh();
      } else {
        setPaymentError(result.message || "Payment wasn't completed. Please try again.");
      }
    } catch (err: any) {
      setPaymentError(err.message || "Payment wasn't completed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto animate-pulse space-y-6">
        <div className="h-8 bg-[var(--color-neutral-200)] rounded-[var(--radius-lg)] w-48" />
        <div className="h-64 bg-[var(--color-neutral-200)] rounded-[var(--radius-xl)]" />
      </div>
    );
  }

  const priceFormatted = formatCurrency(plan?.amount || 1999, plan?.currency || 'INR');

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-neutral-100)] border border-[var(--color-neutral-200)] text-[var(--color-neutral-800)] text-[length:var(--text-caption-size)] font-semibold mb-2">
          <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-success-600)]" />
          SaaS Billing & Membership Plan
        </div>
        <h1 className="text-[length:var(--text-heading-size)] font-bold tracking-tight text-neutral-900">
          GymFlow Subscription
        </h1>
        <p className="text-[length:var(--text-body-size)] text-neutral-600 mt-1">
          Manage your single GymFlow Pro plan, billing cycle, and server-verified payment events.
        </p>
      </div>

      {paymentError && (
        <div className="p-3.5 bg-[var(--color-danger-50)] border border-[var(--color-danger-200)] text-[var(--color-danger-700)] text-[length:var(--text-caption-size)] font-semibold rounded-[var(--radius-lg)] flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-[var(--color-danger-600)]" />
          <span>{paymentError}</span>
        </div>
      )}

      {paymentSuccessMsg && (
        <div className="p-3.5 bg-[var(--color-success-50)] border border-[var(--color-success-200)] text-[var(--color-success-700)] text-[length:var(--text-caption-size)] font-semibold rounded-[var(--radius-lg)] flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-[var(--color-success-600)]" />
          <span>{paymentSuccessMsg}</span>
        </div>
      )}

      {/* Main Plan Card */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-neutral-100)] pb-6">
          <div>
            <span className="text-[length:var(--text-caption-size)] font-semibold text-neutral-500 uppercase tracking-wider">
              Current Active Plan
            </span>
            <h2 className="text-[length:var(--text-subtitle-size)] font-bold text-neutral-900 tracking-tight mt-1">
              {plan?.name || 'GymFlow Pro'}
            </h2>
            <p className="text-[length:var(--text-body-size)] text-neutral-600 mt-0.5">
              Single transparent plan designed for commercial gym owners.
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end">
            <div className="text-3xl font-extrabold text-neutral-900 font-mono tracking-tight">
              {priceFormatted}
              <span className="text-[length:var(--text-body-size)] font-normal text-neutral-500 font-sans"> / month</span>
            </div>
            <div className="mt-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[length:var(--text-caption-size)] font-bold ${
                status === 'ACTIVE' ? 'bg-[var(--color-success-50)] text-[var(--color-success-700)] border border-[var(--color-success-200)]' : 'bg-[var(--color-danger-50)] text-[var(--color-danger-700)] border border-[var(--color-danger-200)]'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${status === 'ACTIVE' ? 'bg-[var(--color-success-500)]' : 'bg-[var(--color-danger-500)]'}`} />
                {status}
              </span>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 border-y border-[var(--color-neutral-100)] sm:border-y-0 sm:border-x pt-2 sm:pt-0">
          <div className="py-4 sm:px-6 border-b sm:border-b-0 sm:border-r border-[var(--color-neutral-100)] space-y-1">
            <div className="flex items-center gap-2 text-[length:var(--text-caption-size)] font-semibold text-neutral-500">
              <Calendar className="w-4 h-4 text-[var(--color-neutral-400)]" />
              Billing Period
            </div>
            <p className="text-[length:var(--text-body-size)] font-bold text-neutral-900">Monthly Auto-Renewal</p>
          </div>

          <div className="py-4 sm:px-6 border-b sm:border-b-0 sm:border-r border-[var(--color-neutral-100)] space-y-1">
            <div className="flex items-center gap-2 text-[length:var(--text-caption-size)] font-semibold text-neutral-500">
              <CreditCard className="w-4 h-4 text-[var(--color-neutral-400)]" />
              Payment Status
            </div>
            <p className="text-[length:var(--text-body-size)] font-bold text-[var(--color-success-600)]">
              {status === 'ACTIVE' ? 'Paid & Verified' : 'Action Required'}
            </p>
          </div>

          <div className="py-4 sm:px-6 space-y-1">
            <div className="flex items-center gap-2 text-[length:var(--text-caption-size)] font-semibold text-neutral-500">
              <RefreshCw className="w-4 h-4 text-[var(--color-neutral-400)]" />
              Next Renewal Date
            </div>
            <p className="text-[length:var(--text-body-size)] font-bold font-mono text-neutral-900">
              {subscription?.renewalDate || '2027-01-01'}
            </p>
          </div>
        </div>

        {/* Plan Included Features */}
        <div className="pt-4 border-t border-[var(--color-neutral-100)] space-y-3">
          <h3 className="text-[length:var(--text-caption-size)] font-semibold text-neutral-500 uppercase tracking-wider">
            Features Included in Your Subscription
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {(plan?.features || [
              'Unlimited Member Management',
              'WhatsApp Payment Reminders',
              'Payment Collection Ledger',
              'UPI QR Code Integration',
              'Multi-Device Access',
              'PostgreSQL RLS Tenant Security',
            ]).map((feat, idx) => (
              <div key={idx} className="flex items-center gap-2 text-[length:var(--text-caption-size)] text-neutral-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-[var(--color-success-600)] shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[var(--color-neutral-100)]">
          <p className="text-[length:var(--text-caption-size)] text-neutral-500">
            {BILLING_CONFIG.isBillingEnabled
              ? 'Cryptographically signed server-side verification powered by Supabase Edge Functions.'
              : 'Platform Access Mode: Controlled Access (SaaS Payment Gateway Disabled).'}
          </p>
          {BILLING_CONFIG.isBillingEnabled ? (
            <Button
              variant="primary"
              size="md"
              isLoading={processing}
              onClick={handleInitiatePayment}
            >
              {status === 'ACTIVE' ? 'Extend Subscription' : 'Renew Subscription'}
            </Button>
          ) : (
            <span className="text-[length:var(--text-caption-size)] font-semibold px-3 py-1.5 rounded-[var(--radius-lg)] bg-[var(--color-success-50)] text-[var(--color-success-700)] border border-[var(--color-success-200)]">
              Controlled Access Active
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
