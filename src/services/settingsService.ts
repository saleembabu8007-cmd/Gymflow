import { ISettingsService } from './interfaces';
import { defaultServices } from './index';

export const settingsService: ISettingsService = {
  getSettings: (gymId) => defaultServices.settings.getSettings(gymId),
  updateSettings: (gymId, updates) => defaultServices.settings.updateSettings(gymId, updates),
  resetToDefaults: (gymId) => defaultServices.settings.resetToDefaults(gymId),
};

export default settingsService;
