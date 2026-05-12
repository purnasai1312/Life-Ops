import fs from 'fs';
import path from 'path';
import {
  buildHabitInsertPayload,
  buildManualActivityPayload,
  buildMealInsertPayload,
  buildProfileUpdatePayload,
  buildReflectionPayload,
  buildWorkoutInsertPayload,
} from '@/utils/lifeops-logic';

describe('data integrity and production safety helpers', () => {
  it('includes authenticated user_id or id in user-owned write payloads', () => {
    expect(buildMealInsertPayload('u1', { mealType: 'snack', foodName: 'Apple' }).user_id).toBe('u1');
    expect(buildWorkoutInsertPayload('u1', { workoutType: 'walking' }).workout.user_id).toBe('u1');
    expect(buildHabitInsertPayload('u1', { title: 'Water', icon: 'water-outline', color: 'sky', cadence: 'daily' }).user_id).toBe('u1');
    expect(buildReflectionPayload('u1', { value: 4 }).user_id).toBe('u1');
    expect(
      buildManualActivityPayload('u1', {
        date: '2026-05-11',
        source: 'manual',
        steps: 0,
        caloriesBurned: 0,
        activeMinutes: 0,
        exerciseMinutes: 0,
        distanceMeters: 0,
        workoutsCount: 0,
      }).user_id
    ).toBe('u1');
    expect(buildProfileUpdatePayload('u1', {}).id).toBe('u1');
  });

  it('does not use fake/random values for production dashboard calculations', () => {
    const calculations = fs.readFileSync(path.join(process.cwd(), 'utils/calculations.ts'), 'utf8');
    const dashboardHelpers = fs.readFileSync(path.join(process.cwd(), 'utils/lifeops-logic.ts'), 'utf8');
    expect(`${calculations}\n${dashboardHelpers}`).not.toMatch(/Math\.random|mock|demo/i);
  });

  it('keeps demo data disabled unless an explicit flag exists', () => {
    const sourceFiles = ['store/useAppStore.ts', 'utils/suggestions.ts', 'utils/goals.ts']
      .map((file) => fs.readFileSync(path.join(process.cwd(), file), 'utf8'))
      .join('\n');
    expect(sourceFiles).not.toMatch(/EXPO_PUBLIC_DEMO_MODE=['"]?true|demoMode:\s*true/i);
  });
});
