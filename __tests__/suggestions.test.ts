import { getMealSuggestions, getWorkoutSuggestions } from '@/utils/suggestions';
import type { Preferences } from '@/store/types';

const basePreferences: Preferences = {
  name: 'Test',
  focusStatement: '',
  hasCompletedOnboarding: true,
  notificationsEnabled: true,
  weekStartsOnMonday: true,
  goal: 'Feel healthier',
  dietPreference: 'No preference',
  workoutPreferences: ['Mixed'],
  experienceLevel: 'Beginner',
};

describe('suggestion filtering', () => {
  it('never shows animal-product meals to vegan users', () => {
    const meals = getMealSuggestions({
      ...basePreferences,
      dietPreference: 'Vegan',
      goal: 'Gain muscle',
    });

    expect(meals.length).toBeGreaterThan(0);
    for (const meal of meals) {
      const combined = `${meal.title} ${meal.notes}`.toLowerCase();
      expect(meal.dietTags).toContain('vegan');
      expect(combined).not.toMatch(/\b(chicken|turkey|salmon|tuna|beef|egg|eggs|yogurt|cheese|dairy|whey|cottage)\b/);
    }
  });

  it('never shows meat or fish to vegetarian users', () => {
    const meals = getMealSuggestions({
      ...basePreferences,
      dietPreference: 'Vegetarian',
      goal: 'Maintain',
    });

    expect(meals.length).toBeGreaterThan(0);
    for (const meal of meals) {
      const combined = `${meal.title} ${meal.notes}`.toLowerCase();
      expect(meal.dietTags).toContain('vegetarian');
      expect(combined).not.toMatch(/chicken|turkey|salmon|tuna|beef|fish/);
    }
  });

  it('filters workouts by goal, preference, and experience', () => {
    const workouts = getWorkoutSuggestions({
      ...basePreferences,
      goal: 'Gain muscle',
      workoutPreferences: ['Gym'],
      experienceLevel: 'Intermediate',
    });

    expect(workouts.length).toBeGreaterThan(0);
    for (const workout of workouts) {
      expect(workout.goalTags).toContain('gain muscle');
      expect(workout.preferenceTags).toContain('gym');
      expect(workout.experienceTags).toContain('intermediate');
    }
  });
});
