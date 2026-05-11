import { Platform } from 'react-native';
import { androidHealthConnect } from './androidHealthConnect';
import { googleFitFallback } from './googleFitFallback';
import { iosHealthKit } from './iosHealthKit';
import { manualFallback } from './manualFallback';
import type { HealthSyncAdapter } from './types';

function getAdapter(): HealthSyncAdapter {
  if (Platform.OS === 'ios') return iosHealthKit;
  if (Platform.OS === 'android') return androidHealthConnect;
  return manualFallback;
}

export async function isHealthSyncAvailable() {
  return getAdapter().isHealthSyncAvailable();
}

export async function requestHealthPermissions() {
  return getAdapter().requestHealthPermissions();
}

export async function getTodayActivity() {
  return getAdapter().getTodayActivity();
}

export async function getActivityRange(startDate: string, endDate: string) {
  return getAdapter().getActivityRange(startDate, endDate);
}

export async function syncDailyActivity(date: string) {
  const adapter = getAdapter();
  const result = await adapter.syncDailyActivity(date);
  if (result) return result;
  if (Platform.OS === 'android') return googleFitFallback.syncDailyActivity(date);
  return manualFallback.syncDailyActivity(date);
}

export async function disconnectHealthSync() {
  return getAdapter().disconnectHealthSync();
}

export { manualFallback };
export type { HealthAvailability, HealthPermissionStatus } from './types';
