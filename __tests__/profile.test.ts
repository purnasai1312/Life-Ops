import {
  buildProfileUpdatePayload,
  safeLogoutFlow,
} from '@/utils/lifeops-logic';
import { getMealSuggestions, getWorkoutSuggestions } from '@/utils/suggestions';
import type { Preferences } from '@/store/types';

describe('profile logic', () => {
  it('maps profile updates to Supabase payload shape', () => {
    expect(
      buildProfileUpdatePayload('u1', {
        name: ' Purna ',
        goal: 'gain muscle',
        dietPreference: 'vegan',
        workoutPreferences: ['home', 'walking'],
        habitPriorities: ['protein', 'sleep'],
        selectedGoals: ['protein'],
      })
    ).toEqual({
      id: 'u1',
      name: 'Purna',
      goal: 'gain muscle',
      diet_preference: 'vegan',
      workout_preference: 'home',
      workout_preferences: ['home', 'walking'],
      habit_priorities: ['protein', 'sleep'],
      selected_goals: ['protein'],
    });
  });

  it('updated preferences change meal and workout filtering', () => {
    const preferences: Preferences = {
      name: 'Purna',
      focusStatement: '',
      hasCompletedOnboarding: true,
      notificationsEnabled: true,
      weekStartsOnMonday: true,
      goal: 'gain muscle',
      dietPreference: 'vegan',
      workoutPreferences: ['home'],
      experienceLevel: 'beginner',
    };
    expect(getMealSuggestions(preferences).every((meal) => meal.dietTags.includes('vegan'))).toBe(true);
    expect(getWorkoutSuggestions(preferences).every((workout) => workout.preferenceTags.includes('home'))).toBe(true);
  });

  it('handles logout local cleanup when Supabase session is missing', async () => {
    const clearLocal = jest.fn(() => Promise.resolve());
    await safeLogoutFlow({
      getSession: () => Promise.resolve({ data: { session: null } }),
      signOut: jest.fn(),
      clearLocal,
    });
    expect(clearLocal).toHaveBeenCalled();
  });
});
