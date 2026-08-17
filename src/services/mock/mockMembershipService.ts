import { IMembershipService, IMembershipFilterOptions } from '../interfaces';
import { MembershipPlan, Membership } from '../../types';
import { storage } from '../storage';
import { generateUUID } from '../../utils/uuid';
import { formatToISODate, calculateNextPaymentDate, addMonths } from '../../utils/dateUtils';

export class MockMembershipService implements IMembershipService {
  private plans: MembershipPlan[] = [];
  private memberships: Membership[] = [];

  constructor() {
    this.reload();
  }

  private reload() {
    this.plans = storage.getPlans();
    this.memberships = storage.getMemberships();
  }

  async getPlans(gymId: string): Promise<MembershipPlan[]> {
    await this.delay(60);
    this.reload();
    return this.plans.filter((p) => !gymId || p.gymId === gymId);
  }

  async getPlanById(planId: string): Promise<MembershipPlan | null> {
    await this.delay(50);
    this.reload();
    return this.plans.find((p) => p.id === planId) || null;
  }

  async createPlan(
    gymId: string,
    planData: Omit<MembershipPlan, 'id' | 'gymId' | 'createdAt'>
  ): Promise<MembershipPlan> {
    await this.delay(120);
    this.reload();
    const newPlan: MembershipPlan = {
      ...planData,
      id: generateUUID(),
      gymId,
      createdAt: new Date().toISOString(),
    };
    this.plans.push(newPlan);
    storage.setPlans(this.plans);
    return newPlan;
  }

  async updatePlan(planId: string, updates: Partial<MembershipPlan>): Promise<MembershipPlan> {
    await this.delay(120);
    this.reload();
    const idx = this.plans.findIndex((p) => p.id === planId);
    if (idx === -1) throw new Error('Membership plan not found');
    this.plans[idx] = { ...this.plans[idx], ...updates };
    storage.setPlans(this.plans);
    return this.plans[idx];
  }

  async deletePlan(planId: string): Promise<void> {
    await this.delay(100);
    this.reload();
    this.plans = this.plans.filter((p) => p.id !== planId);
    storage.setPlans(this.plans);
  }

  async getMemberships(gymId: string, filter?: IMembershipFilterOptions): Promise<Membership[]> {
    await this.delay(80);
    this.reload();
    let results = this.memberships.filter((m) => !gymId || m.gymId === gymId);

    if (filter?.memberId) {
      results = results.filter((m) => m.memberId === filter.memberId);
    }
    if (filter?.planId) {
      results = results.filter((m) => m.planId === filter.planId);
    }
    if (filter?.status) {
      results = results.filter((m) => m.status === filter.status);
    }

    return results;
  }

  async getMemberMemberships(memberId: string): Promise<Membership[]> {
    await this.delay(60);
    this.reload();
    return this.memberships
      .filter((m) => m.memberId === memberId)
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  }

  async getActiveMembership(memberId: string): Promise<Membership | null> {
    await this.delay(50);
    this.reload();
    const active = this.memberships.find(
      (m) => m.memberId === memberId && m.status === 'ACTIVE'
    );
    return active || null;
  }

  async createMembership(
    gymId: string,
    memberId: string,
    planId: string,
    details?: Partial<Membership>
  ): Promise<Membership> {
    await this.delay(150);
    this.reload();

    const plan = this.plans.find((p) => p.id === planId);
    const duration = details?.durationMonths || plan?.durationMonths || 1;
    const feeAmount = details?.feeAmount ?? (plan?.defaultFee || 1500);
    const startDate = details?.startDate || formatToISODate(new Date());
    const endDate = details?.endDate || calculateNextPaymentDate(startDate, duration);

    // Expire any existing active membership for this member
    this.memberships = this.memberships.map((m) =>
      m.memberId === memberId && m.status === 'ACTIVE'
        ? { ...m, status: 'EXPIRED' as const }
        : m
    );

    const newMembership: Membership = {
      id: generateUUID(),
      gymId,
      memberId,
      planId,
      planName: details?.planName || plan?.name || 'Standard Membership',
      durationMonths: duration,
      feeAmount,
      startDate,
      endDate,
      status: details?.status || 'ACTIVE',
      createdAt: new Date().toISOString(),
    };

    this.memberships.unshift(newMembership);
    storage.setMemberships(this.memberships);

    try {
      window.dispatchEvent(new Event('gymflow_storage_updated'));
    } catch {}

    return newMembership;
  }

  async renewMembership(membershipId: string, extensionMonths?: number): Promise<Membership> {
    await this.delay(150);
    this.reload();
    const idx = this.memberships.findIndex((m) => m.id === membershipId);
    if (idx === -1) throw new Error('Membership not found');

    const current = this.memberships[idx];
    const duration = extensionMonths || current.durationMonths || 1;
    const baseDate = new Date(current.endDate) > new Date() ? current.endDate : formatToISODate(new Date());
    const newEndDate = calculateNextPaymentDate(baseDate, duration);

    const updated: Membership = {
      ...current,
      endDate: newEndDate,
      status: 'ACTIVE',
    };

    this.memberships[idx] = updated;
    storage.setMemberships(this.memberships);

    try {
      window.dispatchEvent(new Event('gymflow_storage_updated'));
    } catch {}

    return updated;
  }

  async cancelMembership(membershipId: string): Promise<Membership> {
    await this.delay(100);
    this.reload();
    const idx = this.memberships.findIndex((m) => m.id === membershipId);
    if (idx === -1) throw new Error('Membership not found');

    const updated: Membership = {
      ...this.memberships[idx],
      status: 'CANCELLED',
    };

    this.memberships[idx] = updated;
    storage.setMemberships(this.memberships);

    try {
      window.dispatchEvent(new Event('gymflow_storage_updated'));
    } catch {}

    return updated;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
