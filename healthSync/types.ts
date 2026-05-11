import type { DailyActivitySummary } from '@/store/types';

export type HealthPermissionStatus = 'unavailable' | 'not_requested' | 'granted' | 'denied';

export type HealthAvailability = {
  available: boolean;
  source: DailyActivitySummary['source'];
  status: HealthPermissionStatus;
  requiresNativeBuild: boolean;
  message: string;
};

export type HealthSyncAdapter = {
  isHealthSyncAvailable: () => Promise<HealthAvailability>;
  requestHealthPermissions: () => Promise<HealthAvailability>;
  getTodayActivity: () => Promise<DailyActivitySummary | null>;
  getActivityRange: (startDate: string, endDate: string) => Promise<DailyActivitySummary[]>;
  syncDailyActivity: (date: string) => Promise<DailyActivitySummary | null>;
  disconnectHealthSync: () => Promise<void>;
};
