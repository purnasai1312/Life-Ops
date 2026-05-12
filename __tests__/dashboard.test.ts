import {
  calculateActivitySummary,
  calculateDashboardState,
} from '@/utils/lifeops-logic';
import type { DailyActivitySummary, Habit, MealEntry, MoodEntry, WorkoutLog } from '@/store/types';

const today = '2026-05-11';

describe('dashboard logic', () => {
  it('returns clean zero state for a new user', () => {
    expect(calculateDashboardState({ today })).toEqual(
      expect.objectContaining({
        calories: 0,
        proteinG: 0,
        caloriePercentage: 0,
        proteinPercentage: 0,
        habitPercentage: 0,
        workoutLogged: false,
        reflectionLogged: false,
      })
    );
  });

  it('calculates calories, protein, habits, workout, reflection, and activity from real logs', () => {
    const meals: MealEntry[] = [
      { id: 'm1', userId: 'u1', mealType: 'lunch', foodName: 'Bowl', calories: 700, proteinG: 50, carbsG: 70, fatG: 20, date: today, createdAt: 1 },
      { id: 'm2', userId: 'u1', mealType: 'snack', foodName: 'Shake', calories: 300, proteinG: 40, carbsG: 20, fatG: 6, date: today, createdAt: 2 },
    ];
    const habits: Habit[] = [
      { id: 'h1', title: 'Walk', icon: 'walk-outline', color: 'forest', cadence: 'daily', createdAt: 1, completions: { [today]: true }, streak: 1 },
      { id: 'h2', title: 'Water', icon: 'water-outline', color: 'sky', cadence: 'daily', createdAt: 1, completions: {}, streak: 0 },
    ];
    const workouts: WorkoutLog[] = [{ id: 'w1', userId: 'u1', workoutType: 'gym', durationMinutes: 45, date: today, createdAt: 1 }];
    const reflections: MoodEntry[] = [{ id: 'r1', date: today, value: 4, createdAt: 1 }];
    const activity: DailyActivitySummary = {
      date: today,
      source: 'manual',
      steps: 6000,
      caloriesBurned: 250,
      activeMinutes: 40,
      exerciseMinutes: 25,
      distanceMeters: 4500,
      workoutsCount: 1,
    };

    const summary = calculateDashboardState({
      meals,
      habits,
      workouts,
      reflections,
      activity,
      today,
      calorieTarget: 2000,
      proteinTarget: 120,
      movementGoal: 10000,
    });

    expect(summary.caloriePercentage).toBe(50);
    expect(summary.proteinPercentage).toBe(75);
    expect(summary.habitPercentage).toBe(50);
    expect(summary.workoutLogged).toBe(true);
    expect(summary.reflectionLogged).toBe(true);
    expect(summary.activitySummary.stepsPercentage).toBe(60);
  });

  it('clamps percentages and handles missing/null values safely', () => {
    const summary = calculateDashboardState({
      meals: [{ id: 'm1', userId: 'u1', mealType: 'dinner', foodName: 'Large', calories: 3000, proteinG: 300, carbsG: 0, fatG: 0, date: today, createdAt: 1 }],
      today,
      calorieTarget: 2000,
      proteinTarget: 120,
      movementGoal: null,
    });
    expect(summary.caloriePercentage).toBe(100);
    expect(summary.proteinPercentage).toBe(100);
    expect(summary.activitySummary.stepsPercentage).toBe(0);
    expect(calculateActivitySummary(undefined, 8000).steps).toBe(0);
  });
});
