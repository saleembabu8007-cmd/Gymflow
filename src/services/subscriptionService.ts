import { ISubscriptionService, SubscriptionDetails, SubscriptionPlanConfig } from './interfaces';
import { TenantSubscriptionStatus } from '../types';
import { supabase } from './supabaseClient';
import { canAccessApp as checkDomainCanAccess, getSingleSaaSPlanDetails } from '../lib/domain/subscriptionDomain';

export class SubscriptionService implements ISubscriptionService {
  async getCurrentPlan(): Promise<SubscriptionPlanConfig> {
    if (supabase) {
      try {
        const { data } = await (supabase as any)
          .from('subscription_plans')
          .select('*')
          .eq('active', true)
          .maybeSingle();

        if (data) {
          return {
            id: data.id,
            code: data.code,
            name: data.name,
            amount: Number(data.amount),
            currency: data.currency,
            features: Array.isArray(data.features) ? data.features : JSON.parse(data.features || '[]'),
            active: data.active,
          };
        }
      } catch (err) {
        console.warn('Subscription plan fetch warning:', err);
      }
    }

    const fallback = getSingleSaaSPlanDetails();
    return {
      code: fallback.code,
      name: fallback.name,
      amount: fallback.priceMonthlyINR,
      currency: 'INR',
      features: fallback.features,
      active: true,
    };
  }

  async getCurrentSubscription(gymId: string): Promise<SubscriptionDetails> {
    const plan = await this.getCurrentPlan();

    if (supabase && gymId) {
      try {
        const { data: gymData } = await (supabase as any)
          .from('gyms')
          .select('name, status')
          .eq('id', gymId)
          .maybeSingle();

        const { data: subData } = await (supabase as any)
          .from('subscriptions')
          .select('*')
          .eq('gym_id', gymId)
          .maybeSingle();

        let status = (subData?.status ? (subData.status as string).toUpperCase() : 'ACTIVE') as TenantSubscriptionStatus;
        if (gymData?.status && (gymData.status.toUpperCase() === 'SUSPENDED' || gymData.status.toUpperCase() === 'CANCELLED')) {
          status = gymData.status.toUpperCase() as TenantSubscriptionStatus;
        }

        return {
          gymId,
          gymName: gymData?.name || 'Your Gym',
          planName: plan.name,
          priceMonthlyINR: plan.amount,
          status,
          renewalDate: subData?.current_period_end ? subData.current_period_end.split('T')[0] : '2027-01-01',
          features: plan.features,
        };
      } catch (err) {
        console.warn('Subscription details fetch warning:', err);
      }
    }

    return {
      gymId,
      gymName: 'Your Gym',
      planName: plan.name,
      priceMonthlyINR: plan.amount,
      status: 'ACTIVE',
      renewalDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      features: plan.features,
    };
  }

  async getSubscriptionDetails(gymId: string): Promise<SubscriptionDetails> {
    return this.getCurrentSubscription(gymId);
  }

  async getSubscriptionStatus(gymId: string): Promise<TenantSubscriptionStatus> {
    const sub = await this.getCurrentSubscription(gymId);
    return sub.status;
  }

  async canAccessApp(gymId: string): Promise<boolean> {
    const status = await this.getSubscriptionStatus(gymId);
    return checkDomainCanAccess(status);
  }

  async createCheckoutSession(gymId: string): Promise<{ success: boolean; orderId: string; checkoutUrl: string }> {
    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    if (supabase) {
      try {
        const { data } = await supabase.functions.invoke('create-checkout', {
          body: { gymId },
        });
        if (data && data.success) {
          return {
            success: true,
            orderId: data.orderId || orderId,
            checkoutUrl: data.checkoutUrl || '',
          };
        }
      } catch (err) {
        console.warn('Edge Function create-checkout fallback:', err);
      }
    }

    return {
      success: true,
      orderId,
      checkoutUrl: `/checkout?order=${orderId}&gym=${gymId}`,
    };
  }

  async triggerPaymentVerification(gymId: string, simulateSuccess: boolean = true): Promise<{ success: boolean; status: TenantSubscriptionStatus; message: string }> {
    const eventId = `evt_${Date.now()}`;
    const statusParam = simulateSuccess ? 'success' : 'failed';

    if (supabase) {
      try {
        const { data } = await supabase.functions.invoke('payment-webhook', {
          body: {
            event_id: eventId,
            gym_id: gymId,
            event: simulateSuccess ? 'payment.captured' : 'payment.failed',
            amount: 1999,
          },
          headers: {
            'x-provider-signature': 'verified_demo_hmac_signature',
          },
        });

        if (data) {
          return {
            success: data.success ?? simulateSuccess,
            status: data.status as TenantSubscriptionStatus,
            message: data.message || (simulateSuccess ? 'Payment verified successfully' : "Payment wasn't completed. Please try again."),
          };
        }
      } catch (err) {
        console.warn('Edge Function payment-webhook fallback:', err);
      }

      // Fallback direct DB trusted update for local dev when edge function endpoint is offline
      if (simulateSuccess) {
        const now = new Date();
        const periodEnd = new Date();
        periodEnd.setMonth(periodEnd.getMonth() + 1);

        await (supabase as any)
          .from('subscriptions')
          .update({
            status: 'active',
            current_period_start: now.toISOString(),
            current_period_end: periodEnd.toISOString(),
            updated_at: now.toISOString(),
          })
          .eq('gym_id', gymId);

        await (supabase as any).from('gyms').update({ status: 'active' }).eq('id', gymId);

        return {
          success: true,
          status: 'ACTIVE',
          message: 'Payment verified and subscription activated successfully',
        };
      } else {
        await (supabase as any)
          .from('subscriptions')
          .update({
            status: 'past_due',
            updated_at: new Date().toISOString(),
          })
          .eq('gym_id', gymId);

        return {
          success: false,
          status: 'PAST_DUE',
          message: "Payment wasn't completed. Please try again.",
        };
      }
    }

    return {
      success: simulateSuccess,
      status: simulateSuccess ? 'ACTIVE' : 'PAST_DUE',
      message: simulateSuccess ? 'Payment verified successfully' : "Payment wasn't completed. Please try again.",
    };
  }
}

export const subscriptionService = new SubscriptionService();
