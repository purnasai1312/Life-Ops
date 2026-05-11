import { manualFallback } from './manualFallback';
import type { HealthAvailability, HealthSyncAdapter } from './types';

const unavailable: HealthAvailability = {
  available: false,
  source: 'apple_health',
  status: 'unavailable',
  requiresNativeBuild: true,
  message: 'Health sync is unavailable in this version. You can still add activity manually.',
};

const logDevDetails = () => {
  if (__DEV__) {
    console.info(
      '[Health Sync] Apple Health unavailable. Install and configure a HealthKit native module in an iOS development or release build to enable Apple Health and Apple Watch sync.'
    );
  }
};

export const iosHealthKit: HealthSyncAdapter = {
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
