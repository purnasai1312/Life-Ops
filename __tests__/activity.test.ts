import {
  HEALTH_SYNC_UNAVAILABLE_MESSAGE,
  buildManualActivityPayload,
  calculateActivitySummary,
  groupByDate,
} from '@/utils/lifeops-logic';
import { manualFallback } from '@/healthSync/manualFallback';
import type { DailyActivitySummary } from '@/store/types';

describe('activity and health sync fallback logic', () => {
  it('keeps manual fallback available when native sync is unavailable', async () => {
    const availability = await manualFallback.isHealthSyncAvailable();
    expect(availability).toEqual(expect.objectContaining({ available: true, source: 'manual' }));
  });

  it('uses user-facing unavailable copy without developer terms', () => {
    expect(HEALTH_SYNC_UNAVAILABLE_MESSAGE).toBe(
      'Health sync is unavailable in this version. You can still add activity manually.'
    );
    expect(HEALTH_SYNC_UNAVAILABLE_MESSAGE).not.toMatch(/Expo Go|native build|dev\/EAS|HealthKit package/i);
  });

  it('maps manual activity payload and dashboard summary', () => {
    const activity: DailyActivitySummary = {
      date: '2026-05-11',
      source: 'manual',
      steps: 7532.8,
      caloriesBurned: 310,
      activeMinutes: 45,
      exerciseMinutes: 30,
      distanceMeters: 5200,
      workoutsCount: 1,
      sleepMinutes: 420,
      avgHeartRate: 72,
    };
    expect(buildManualActivityPayload('u1', activity)).toEqual(
      expect.objectContaining({
        user_id: 'u1',
        source: 'manual',
        steps: 7533,
        calories_burned: 310,
        active_minutes: 45,
      })
    );
    expect(calculateActivitySummary(activity, 10000)).toEqual(
      expect.objectContaining({ steps: 7532.8, caloriesBurned: 310, stepsPercentage: 75.328 })
    );
  });

  it('groups 7-day and 30-day activity history by date', () => {
    const rows: DailyActivitySummary[] = [
      { date: '2026-05-11', source: 'manual', steps: 1, caloriesBurned: 0, activeMinutes: 0, exerciseMinutes: 0, distanceMeters: 0, workoutsCount: 0 },
      { date: '2026-05-01', source: 'manual', steps: 2, caloriesBurned: 0, activeMinutes: 0, exerciseMinutes: 0, distanceMeters: 0, workoutsCount: 0 },
    ];
    expect(Object.keys(groupByDate(rows))).toEqual(['2026-05-11', '2026-05-01']);
  });
});
