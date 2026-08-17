import { IAdminService } from './interfaces';
import { PlatformGymTenant, PlatformStats } from '../types';
import { defaultServices } from './index';

export class AdminService implements IAdminService {
  async getStats(): Promise<PlatformStats> {
    return defaultServices.admin.getStats();
  }

  async getGymTenants(): Promise<PlatformGymTenant[]> {
    return defaultServices.admin.getGymTenants();
  }

  async updateGymStatus(gymId: string, status: 'ACTIVE' | 'SUSPENDED' | 'CANCELLED'): Promise<PlatformGymTenant> {
    return defaultServices.admin.updateGymStatus(gymId, status);
  }
}

export const adminService = new AdminService();
