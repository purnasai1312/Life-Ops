import { manualFallback } from './manualFallback';
import type { HealthAvailability, HealthSyncAdapter } from './types';

const unavailable: HealthAvailability = {
  available: false,
  source: 'google_fit',
  status: 'unavailable',
  requiresNativeBuild: true,
  message: 'Health sync is unavailable in this version. You can still add activity manually.',
};

const logDevDetails = () => {
  if (__DEV__) {
    console.info(
      '[Health Sync] Google Fit fallback unavailable. Configure Google Fit OAuth and a native module in an Android development or release build only if Health Connect is not available.'
    );
  }
};

export const googleFitFallback: HealthSyncAdapter = {
  isHealthSyncAvailable: async () => {
    logDevDetails();
    return unavailable;
  },
  requestHealthPermissions: async () => {
    logDevDetails();
    return unavailable;
  },
  getTodayActivity: manualFallback.getTodayActivity,
  getActivityRange: manualFallback.getActivityRange,
  syncDailyActivity: async () => null,
  disconnectHealthSync: async () => {},
};
