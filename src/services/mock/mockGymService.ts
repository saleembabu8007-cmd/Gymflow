import { IGymService } from '../interfaces';
import { Gym, MembershipPlan } from '../../types';
import { storage } from '../storage';
import { generateUUID } from '../../utils/uuid';

export class MockGymService implements IGymService {
  async getGym(gymId: string): Promise<Gym | null> {
    await this.delay(80);
    const gym = storage.getGym();
    return !gymId || gym.id === gymId ? gym : gym;
  }

  async getGymByOwnerId(ownerId: string): Promise<Gym | null> {
    await this.delay(80);
    const gym = storage.getGym();
    return gym && gym.ownerId === ownerId ? gym : null;
  }

  async createGym(ownerId: string, dto: { name: string; phone: string; currency?: string; timezone?: string; upiId?: string }): Promise<Gym> {
    await this.delay(150);
    // Enforce 1 Gym Per Owner Rule
    const existing = await this.getGymByOwnerId(ownerId);
    if (existing) {
      return existing;
    }

    const gymId = `gym-${Date.now()}`;
    const gym: Gym = {
      id: gymId,
      name: dto.name,
      phone: dto.phone,
      upiId: dto.upiId || 'gym@upi',
      ownerId,
      createdAt: new Date().toISOString(),
    };

    storage.setGym(gym);
    const user = storage.getUser();
    if (user && user.id === ownerId) {
      user.gymId = gymId;
      storage.setUser(user);
      storage.setAuthSession({ isAuthenticated: true, user });
    }

    try {
      window.dispatchEvent(new Event('gymflow_storage_updated'));
    } catch {}

    return gym;
  }

  async updateGym(_gymId: string, updates: Partial<Gym>): Promise<Gym> {
    await this.delay(120);
    const current = storage.getGym();
    const updated: Gym = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    storage.setGym(updated);
    try {
      window.dispatchEvent(new Event('gymflow_storage_updated'));
    } catch {}
    return updated;
  }

  async getPlans(gymId: string): Promise<MembershipPlan[]> {
    await this.delay(80);
    const plans = storage.getPlans();
    return plans.filter((p) => !gymId || p.gymId === gymId);
  }

  async createPlan(
    gymId: string,
    planData: Omit<MembershipPlan, 'id' | 'gymId' | 'createdAt'>
  ): Promise<MembershipPlan> {
    await this.delay(120);
    const plans = storage.getPlans();
    const newPlan: MembershipPlan = {
      ...planData,
      id: generateUUID(),
      gymId,
      createdAt: new Date().toISOString(),
    };
    plans.push(newPlan);
    storage.setPlans(plans);
    return newPlan;
  }

  async updatePlan(planId: string, updates: Partial<MembershipPlan>): Promise<MembershipPlan> {
    await this.delay(120);
    const plans = storage.getPlans();
    const idx = plans.findIndex((p) => p.id === planId);
    if (idx === -1) throw new Error('Plan not found');
    plans[idx] = { ...plans[idx], ...updates };
    storage.setPlans(plans);
    return plans[idx];
  }

  async deletePlan(planId: string): Promise<void> {
    await this.delay(100);
    const plans = storage.getPlans();
    const filtered = plans.filter((p) => p.id !== planId);
    storage.setPlans(filtered);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
