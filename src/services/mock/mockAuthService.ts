import { IAuthService, RegisterGymOwnerDTO } from '../interfaces';
import { User, Gym } from '../../types';
import { storage } from '../storage';
import { mockUser } from '../../data/mockData';

const PASSWORD_STORAGE_KEY = 'gymflow_mock_password';

export class MockAuthService implements IAuthService {
  async getCurrentUser(): Promise<User | null> {
    await this.delay(60);
    const session = storage.getAuthSession();
    return session.isAuthenticated ? session.user : null;
  }

  async login(email: string, password?: string): Promise<User> {
    await this.delay(250);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password || '';

    // Validate email format
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Email or password is incorrect.');
    }

    let savedPass = 'password123';
    try {
      savedPass = localStorage.getItem(PASSWORD_STORAGE_KEY) || 'password123';
    } catch {}

    if (cleanPassword !== savedPass && cleanPassword !== 'password123') {
      throw new Error('Email or password is incorrect.');
    }

    const currentUser = storage.getUser();
    const isAdminEmail = cleanEmail.includes('admin');
    const user: User = {
      ...currentUser,
      id: currentUser.id || `user-${Date.now()}`,
      email: cleanEmail,
      name: cleanEmail.includes('vikram')
        ? 'Vikram Sharma'
        : isAdminEmail
        ? 'Platform Admin'
        : currentUser.name || 'Gym Owner',
      role: isAdminEmail ? 'PLATFORM_ADMIN' : currentUser.role || 'GYM_OWNER',
    };

    storage.setUser(user);
    storage.setAuthSession({ isAuthenticated: true, user });

    try {
      window.dispatchEvent(new Event('gymflow_storage_updated'));
    } catch {}

    return user;
  }

  async signUp(dto: { fullName: string; email: string; password?: string }): Promise<User> {
    await this.delay(200);
    const userId = `user-${Date.now()}`;
    const user: User = {
      id: userId,
      name: dto.fullName,
      email: dto.email,
      gymId: '',
      role: 'GYM_OWNER',
    };

    storage.setUser(user);
    storage.setAuthSession({ isAuthenticated: true, user });

    try {
      window.dispatchEvent(new Event('gymflow_storage_updated'));
    } catch {}

    return user;
  }

  async registerOwner(dto: RegisterGymOwnerDTO): Promise<{ user: User; gym: Gym }> {
    await this.delay(300);
    const gymId = `gym-${Date.now()}`;
    const userId = `user-${Date.now()}`;

    const user: User = {
      id: userId,
      name: dto.ownerName,
      email: dto.email,
      phone: dto.phone,
      gymId,
      role: 'GYM_OWNER',
    };

    const gym: Gym = {
      id: gymId,
      name: dto.gymName,
      phone: dto.phone,
      upiId: dto.upiId || 'gym@upi',
      ownerId: userId,
      createdAt: new Date().toISOString(),
    };

    storage.setUser(user);
    storage.setGym(gym);
    storage.setAuthSession({ isAuthenticated: true, user });

    try {
      window.dispatchEvent(new Event('gymflow_storage_updated'));
    } catch {}

    return { user, gym };
  }

  async logout(): Promise<void> {
    await this.delay(100);
    storage.setAuthSession({ isAuthenticated: false, user: null });
    try {
      window.dispatchEvent(new Event('gymflow_storage_updated'));
    } catch {}
  }

  async resetPassword(email: string): Promise<void> {
    await this.delay(200);
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Please provide a valid email address.');
    }
  }

  async updatePassword(newPassword: string, _token?: string): Promise<void> {
    await this.delay(200);
    if (!newPassword || newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }
    try {
      localStorage.setItem(PASSWORD_STORAGE_KEY, newPassword);
    } catch {}
  }

  async updateProfile(updates: Partial<User>): Promise<User> {
    await this.delay(120);
    const currentUser = storage.getUser();
    const updated: User = {
      ...currentUser,
      ...updates,
    };
    storage.setUser(updated);
    storage.setAuthSession({ isAuthenticated: true, user: updated });

    try {
      window.dispatchEvent(new Event('gymflow_storage_updated'));
    } catch {}

    return updated;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
