import React from 'react';
import { useSubscription } from '../../hooks/useSubscription';
import { ExpiredSubscriptionPage } from '../../pages/ExpiredSubscriptionPage';
import { LoadingState } from '../ui/LoadingState';
import { AlertCircle, CreditCard, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';

interface SubscriptionEntitlementGuardProps {
  gymId?: string;
  isPlatformAdmin?: boolean;
  onNavigateToSubscription?: () => void;
  children: React.ReactNode;
}

export const SubscriptionEntitlementGuard: React.FC<SubscriptionEntitlementGuardProps> = ({
  gymId,
  isPlatformAdmin = false,
  onNavigateToSubscription,
  children,
}) => {
  const { status, canAccess, loading } = useSubscription(gymId);

  // Platform Admins bypass gym tenant paywall checks
  if (isPlatformAdmin) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white font-sans">
        <LoadingState message="Verifying SaaS subscription entitlement..." />
      </div>
    );
  }

  // EXPIRED or SUSPENDED: Block access to dashboard and route directly to Renewal Paywall
  // Note: All tenant data (members, payments, reminders) is safely preserved in DB.
  if (status === 'EXPIRED' || status === 'SUSPENDED' || !canAccess) {
    return <ExpiredSubscriptionPage />;
  }

  // PAST_DUE: Active with top billing warning banner informing gym owner to settle invoice
  const isPastDue = status === 'PAST_DUE';

  return (
    <div className="w-full">
      {isPastDue && (
        <div className="bg-amber-500 text-neutral-950 px-4 py-2.5 font-sans border-b border-amber-600/40 text-xs font-semibold flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-neutral-950 shrink-0" />
            <span>
              Your SaaS subscription billing is <strong>PAST DUE</strong>. Please update your payment method to maintain uninterrupted service.
            </span>
          </div>
          {onNavigateToSubscription && (
            <button
              type="button"
              id="btn-settle-past-due"
              onClick={onNavigateToSubscription}
              className="px-3 py-1 rounded-lg bg-neutral-950 text-white hover:bg-neutral-800 text-[11px] font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
            >
              <CreditCard className="w-3.5 h-3.5 text-amber-400" />
              <span>Settle Subscription</span>
            </button>
          )}
        </div>
      )}

      {children}
    </div>
  );
};
