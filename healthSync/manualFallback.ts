import type { HealthAvailability, HealthSyncAdapter } from './types';

const availability: HealthAvailability = {
  available: true,
  source: 'manual',
  status: 'granted',
  requiresNativeBuild: false,
  message: 'Manual activity logging is available.',
};

export const manualFallback: HealthSyncAdapter = {
  isHealthSyncAvailable: async () => availability,
  requestHealthPermissions: async () => availability,
  getTodayActivity: async () => null,
  getActivityRange: async () => [],
  syncDailyActivity: async () => null,
  disconnectHealthSync: async () => {},
};
