import { useState, useEffect, useCallback } from 'react';
import { useServices } from '../services/provider';
import { GymSettings } from '../types';
import { DEFAULT_GYM_ID } from '../data/mockData';

export function useGymSettings(gymId: string = DEFAULT_GYM_ID) {
  const { settings: settingsService } = useServices();
  const [settings, setSettings] = useState<GymSettings>({
    id: '',
    gymId,
    currencySymbol: '₹',
    currencyCode: 'INR',
    reminderDaysBeforeDue: 3,
    defaultMonthlyFee: 1500,
    defaultMembershipDuration: '1_MONTH',
    whatsappTemplate: '',
    timezone: 'Asia/Kolkata',
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await settingsService.getSettings(gymId);
      setSettings(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, [settingsService, gymId]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettings = useCallback(
    async (updates: Partial<GymSettings>) => {
      const updated = await settingsService.updateSettings(gymId, updates);
      setSettings(updated);
      return updated;
    },
    [settingsService, gymId]
  );

  const resetToDefaults = useCallback(async () => {
    const reset = await settingsService.resetToDefaults(gymId);
    setSettings(reset);
    return reset;
  }, [settingsService, gymId]);

  return {
    settings,
    currencySymbol: settings.currencySymbol || '₹',
    currencyCode: settings.currencyCode || 'INR',
    loading,
    error,
    updateSettings,
    resetToDefaults,
    refresh: fetchSettings,
  };
}
