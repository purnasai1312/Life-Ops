import {
  buildHabitDeleteFilter,
  buildHabitInsertPayload,
  buildHabitLogPayload,
  getHabitCompletionSummary,
  toggleHabitCompletion,
} from '@/utils/lifeops-logic';
import { computeStreak } from '@/utils/calculations';
import type { Habit } from '@/store/types';

const today = '2026-05-11';

describe('habit logic', () => {
  it('maps create habit and delete filters with authenticated user_id', () => {
    expect(
      buildHabitInsertPayload('u1', {
        title: ' Morning pages ',
        icon: 'book-outline',
        color: 'mustard',
        cadence: 'daily',
      })
    ).toEqual({ user_id: 'u1', title: 'Morning pages', icon: 'book-outline', color: 'mustard', cadence: 'daily' });
    expect(buildHabitDeleteFilter('u1', 'h1')).toEqual({ user_id: 'u1', id: 'h1' });
  });

  it('marks and unmarks completion using habit log payloads', () => {
    expect(buildHabitLogPayload('u1', 'h1', today)).toEqual({
      user_id: 'u1',
      habit_id: 'h1',
      log_date: today,
      completed: true,
    });
    const completed = toggleHabitCompletion({}, today);
    expect(completed[today]).toBe(true);
    expect(toggleHabitCompletion(completed, today)[today]).toBeUndefined();
  });

  it('calculates daily completion percentage', () => {
    const habits: Habit[] = [
      { id: 'h1', title: 'A', icon: 'leaf-outline', color: 'forest', cadence: 'daily', createdAt: 1, completions: { [today]: true }, streak: 1 },
      { id: 'h2', title: 'B', icon: 'water-outline', color: 'sky', cadence: 'daily', createdAt: 1, completions: {}, streak: 0 },
    ];
    expect(getHabitCompletionSummary(habits, today)).toEqual({ completed: 1, total: 2, percentage: 50 });
  });

  it('calculates streaks and breaks on missed days', () => {
    expect(
      computeStreak(
        {
          '2026-05-11': true,
          '2026-05-10': true,
          '2026-05-09': true,
        },
        new Date('2026-05-11T12:00:00')
      )
    ).toBe(3);
    expect(
      computeStreak(
        {
          '2026-05-11': true,
          '2026-05-09': true,
        },
        new Date('2026-05-11T12:00:00')
      )
    ).toBe(1);
  });
});
