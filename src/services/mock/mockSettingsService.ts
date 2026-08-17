import { ISettingsService } from '../interfaces';
import { GymSettings } from '../../types';
import { storage } from '../storage';
import { mockSettings } from '../../data/mockData';

export class MockSettingsService implements ISettingsService {
  async getSettings(_gymId: string): Promise<GymSettings> {
    await this.delay(60);
    return storage.getSettings();
  }

  async updateSettings(_gymId: string, updates: Partial<GymSettings>): Promise<GymSettings> {
    await this.delay(100);
    const current = storage.getSettings();
    const updated: GymSettings = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    storage.setSettings(updated);

    try {
      window.dispatchEvent(new Event('gymflow_storage_updated'));
    } catch {}

    return updated;
  }

  async resetToDefaults(_gymId: string): Promise<GymSettings> {
    await this.delay(120);
    storage.setSettings(mockSettings);

    try {
      window.dispatchEvent(new Event('gymflow_storage_updated'));
    } catch {}

    return mockSettings;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
