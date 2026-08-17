import { IAdminService } from '../interfaces';
import { PlatformGymTenant, PlatformStats } from '../../types';

export class MockAdminService implements IAdminService {
  private mockTenants: PlatformGymTenant[] = [
    {
      id: 'gym-001',
      name: 'Iron Fitness Gym',
      ownerName: 'Vikram Sharma',
      ownerEmail: 'vikram@ironfitness.in',
      phone: '+91 98765 43210',
      status: 'ACTIVE',
      memberCount: 24,
      subscriptionPlan: 'GymFlow Pro (Single Plan)',
      renewalDate: '2027-08-15',
      createdAt: '2026-01-10',
    },
    {
      id: 'gym-002',
      name: 'PowerHouse Fitness Club',
      ownerName: 'Rahul Verma',
      ownerEmail: 'rahul@powerhouse.in',
      phone: '+91 98123 45678',
      status: 'ACTIVE',
      memberCount: 42,
      subscriptionPlan: 'GymFlow Pro (Single Plan)',
      renewalDate: '2027-06-20',
      createdAt: '2026-02-01',
    },
    {
      id: 'gym-003',
      name: 'Titan Gym & Crossfit',
      ownerName: 'Ananya Roy',
      ownerEmail: 'ananya@titanfit.in',
      phone: '+91 97777 88888',
      status: 'SUSPENDED',
      memberCount: 15,
      subscriptionPlan: 'GymFlow Pro (Single Plan)',
      renewalDate: '2026-07-01',
      createdAt: '2026-03-12',
    },
  ];

  async getStats(): Promise<PlatformStats> {
    await this.delay(100);
    const activeSubs = this.mockTenants.filter((t) => t.status === 'ACTIVE').length;
    const suspended = this.mockTenants.filter((t) => t.status === 'SUSPENDED').length;
    const totalMembers = this.mockTenants.reduce((acc, t) => acc + t.memberCount, 0);

    return {
      totalGyms: this.mockTenants.length,
      activeGyms: activeSubs,
      pendingPayments: 3,
      activeSubscriptions: activeSubs,
      pastDueSubscriptions: 1,
      cancelledSubscriptions: 0,
      mrr: activeSubs * 1999,
      suspendedGyms: suspended,
      totalMembers,
    };
  }

  async getGymTenants(): Promise<PlatformGymTenant[]> {
    await this.delay(120);
    return [...this.mockTenants];
  }

  async updateGymStatus(gymId: string, status: 'ACTIVE' | 'SUSPENDED' | 'CANCELLED'): Promise<PlatformGymTenant> {
    await this.delay(150);
    const target = this.mockTenants.find((t) => t.id === gymId);
    if (!target) throw new Error('Gym tenant not found');
    target.status = status;
    return { ...target };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
