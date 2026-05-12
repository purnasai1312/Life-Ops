import {
  buildReflectionPayload,
  groupByDate,
  hasCheckInToday,
  sanitizeMoodValue,
} from '@/utils/lifeops-logic';
import type { MoodEntry } from '@/store/types';

describe('reflect logic', () => {
  it('maps create check-in payload with authenticated user_id', () => {
    expect(buildReflectionPayload('u1', { value: 4, note: ' Calm ', date: '2026-05-11' })).toEqual({
      user_id: 'u1',
      reflection_date: '2026-05-11',
      mood_value: 4,
      note: 'Calm',
    });
  });

  it('detects today check-in and handles mood values safely', () => {
    const entries: MoodEntry[] = [{ id: 'r1', date: '2026-05-11', value: 5, createdAt: 1 }];
    expect(hasCheckInToday(entries, '2026-05-11')).toBe(true);
    expect(hasCheckInToday(entries, '2026-05-10')).toBe(false);
    expect(sanitizeMoodValue(8)).toBe(5);
    expect(sanitizeMoodValue(-2)).toBe(1);
    expect(sanitizeMoodValue(null)).toBe(3);
  });

  it('groups 7-day and 30-day reflection history by date', () => {
    const entries: MoodEntry[] = [
      { id: 'r1', date: '2026-05-11', value: 4, createdAt: 1 },
      { id: 'r2', date: '2026-05-05', value: 3, createdAt: 2 },
    ];
    expect(groupByDate(entries)).toEqual({
      '2026-05-11': [entries[0]],
      '2026-05-05': [entries[1]],
    });
  });
});
