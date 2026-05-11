import { manualFallback } from './manualFallback';
import type { HealthAvailability, HealthSyncAdapter } from './types';

const unavailable: HealthAvailability = {
  available: false,
  source: 'health_connect',
  status: 'unavailable',
  requiresNativeBuild: true,
  message: 'Health sync is unavailable in this version. You can still add activity manually.',
};

const logDevDetails = () => {
  if (__DEV__) {
    console.info(
      '[Health Sync] Health Connect unavailable. Install and configure an Android Health Connect native module in a development or release build to enable device health sync.'
    );
  }
};

export const androidHealthConnect: HealthSyncAdapter = {
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
