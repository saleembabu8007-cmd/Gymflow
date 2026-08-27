import React, { useState } from 'react';
import { RefreshCw, LogOut, CheckCircle2, Lock, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { useSubscription } from '../hooks/useSubscription';
import { useServices } from '../services/provider';
import { formatCurrency } from '../utils/currencyUtils';
import { BILLING_CONFIG } from '../lib/domain/subscriptionDomain';

export const ExpiredSubscriptionPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { subscription: subService } = useServices();
  const { plan, refresh } = useSubscription(user?.gymId);

  const [renewing, setRenewing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handleRenew = async () => {
    if (!user?.gymId) return;
    setRenewing(true);
    setPaymentError(null);

    try {
      await subService.createCheckoutSession(user.gymId);
      const res = await subService.triggerPaymentVerification(user.gymId, true);

      if (res.success) {
        await refresh();
      } else {
        setPaymentError(res.message || "Payment wasn't completed.");
      }
    } catch (err: any) {
      setPaymentError(err.message || "Payment wasn't completed. Please try again.");
    } finally {
      setRenewing(false);
    }
  };

  const priceFormatted = formatCurrency(plan?.amount || 1999, plan?.currency || 'INR');

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-md space-y-8">
        {/* Lock Banner Header */}
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-[var(--radius-xl)] bg-[var(--color-warning-500)]/10 border border-[var(--color-warning-500)]/20 text-[var(--color-warning-600)] flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-[length:var(--text-heading-size)] font-bold tracking-tight text-neutral-900">
            Your GymFlow subscription has expired
          </h1>
          <p className="text-[length:var(--text-body-size)] text-neutral-600 leading-relaxed">
            Renew your subscription to continue managing your gym. Your member records and payment history remain completely safe.
          </p>
        </div>

        {/* Paywall */}
        <div className="space-y-8">
          {paymentError && (
            <div className="mb-4 p-3.5 bg-[var(--color-danger-50)] border border-[var(--color-danger-200)] text-[var(--color-danger-700)] text-[length:var(--text-caption-size)] font-semibold rounded-[var(--radius-lg)] flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-[var(--color-danger-600)]" />
              <span>{paymentError}</span>
            </div>
          )}

          <div className="py-4 border-y border-[var(--color-neutral-100)] space-y-2">
            <div className="flex items-center justify-between text-[length:var(--text-caption-size)] font-semibold text-neutral-500 uppercase tracking-wider">
              <span>Plan</span>
              <span>Price</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[length:var(--text-subtitle-size)] font-bold text-neutral-900">{plan?.name || 'GymFlow Pro'}</span>
              <span className="text-[length:var(--text-subtitle-size)] font-bold font-mono text-neutral-900">{priceFormatted} / mo</span>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-[length:var(--text-caption-size)] font-semibold text-neutral-500 uppercase tracking-wider">
              Included Features
            </h3>
            <div className="space-y-2">
              {[
                'Unlimited Members',
                'WhatsApp Payment Reminders',
                'Payment Collection Ledger',
                'PostgreSQL RLS Tenant Isolation',
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-[length:var(--text-caption-size)] text-neutral-700">
                  <CheckCircle2 className="w-4 h-4 text-[var(--color-success-600)] shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {BILLING_CONFIG.isBillingEnabled ? (
            <Button
              variant="primary"
              size="lg"
              fullWidth
              isLoading={renewing}
              onClick={handleRenew}
            >
              {paymentError ? 'Retry Payment' : 'Renew Subscription'}
            </Button>
          ) : (
            <div className="py-3 border-y border-[var(--color-neutral-100)] text-neutral-700 text-[length:var(--text-caption-size)] font-semibold text-center">
              Access suspended by Platform Administrator. Please contact platform support.
            </div>
          )}

          <div className="pt-4 flex items-center justify-between">
            <span className="text-[length:var(--text-caption-size)] text-neutral-500 font-mono">Signed in as {user?.email}</span>
            <Button
              type="button"
              variant="tertiary"
              onClick={logout}
              className="flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
