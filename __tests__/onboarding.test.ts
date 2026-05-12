import {
  buildOnboardingUpsertPayload,
  buildProfileUpsertPayload,
  isOnboardingComplete,
  selectedGoalsToGoalRecords,
  validateOnboardingProfile,
} from '@/utils/lifeops-logic';
import type { OnboardingProfile, Preferences } from '@/store/types';

const validProfile: OnboardingProfile = {
  userId: 'user-1',
  name: 'Purna',
  focusStatement: 'Steady health',
  age: '28',
  height: '5 ft 8 in',
  weight: '170 lb',
  goal: 'lose weight',
  activityLevel: 'moderate',
  dietPreference: 'vegetarian',
  workoutPreference: 'mixed',
  workoutPreferences: ['gym', 'walking'],
  experienceLevel: 'beginner',
  calorieTarget: '1900',
  proteinTarget: '140',
  waterTarget: '90',
  workoutFrequencyGoal: '3',
  movementGoal: '9000',
  habitPriorities: ['sleep', 'protein'],
  selectedGoals: ['protein', 'walking'],
  habits: ['morning walk'],
  intentions: ['feel lighter'],
};

describe('onboarding logic', () => {
  it('validates required fields before completion', () => {
    const result = validateOnboardingProfile({ ...validProfile, name: '', selectedGoals: [] });
    expect(result.valid).toBe(false);
    expect(result.errors.name).toBe('Required');
    expect(result.errors.selectedGoals).toBe('Choose at least one');
    expect(isOnboardingComplete(validProfile)).toBe(true);
  });

  it('persists multi-select workout preferences and habit priorities as arrays', () => {
    const payload = buildProfileUpsertPayload('user-1', validProfile);
    expect(payload.workout_preferences).toEqual(['gym', 'walking']);
    expect(payload.habit_priorities).toEqual(['sleep', 'protein']);
    expect(payload.selected_goals).toEqual(['protein', 'walking']);
  });

  it('converts selected onboarding goals into real goal records', () => {
    const preferences: Preferences = {
      name: 'Purna',
      focusStatement: '',
      hasCompletedOnboarding: true,
      notificationsEnabled: true,
      weekStartsOnMonday: true,
      proteinTarget: '145',
      movementGoal: '8500',
    };
    const records = selectedGoalsToGoalRecords('user-1', ['protein', 'walking'], preferences);
    expect(records).toHaveLength(2);
    expect(records).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ user_id: 'user-1', title: 'Hit protein target', target: 145, progress: 0 }),
        expect.objectContaining({ user_id: 'user-1', title: 'Walk 8,000 steps/day', target: 8500, progress: 0 }),
      ])
    );
  });

  it('sets onboarding completion only after final valid submit', () => {
    expect(buildProfileUpsertPayload('user-1', validProfile).has_completed_onboarding).toBe(true);
    expect(buildProfileUpsertPayload('user-1', { ...validProfile, proteinTarget: '' }).has_completed_onboarding).toBe(false);
  });

  it('maps onboarding persistence to onboarding table columns only', () => {
    const payload = buildOnboardingUpsertPayload('user-1', validProfile);
    expect(payload).toEqual(expect.objectContaining({ user_id: 'user-1', workout_preferences: ['gym', 'walking'] }));
    expect(payload).not.toHaveProperty('id');
    expect(payload).not.toHaveProperty('name');
    expect(payload).not.toHaveProperty('has_completed_onboarding');
    expect(payload.completed_at).toEqual(expect.any(String));
  });
});
