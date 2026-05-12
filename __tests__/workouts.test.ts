import {
  buildWorkoutInsertPayload,
  buildWorkoutUpdatePayload,
  groupByDate,
  workoutSuggestionToWorkoutInput,
} from '@/utils/lifeops-logic';
import { getWorkoutSuggestions } from '@/utils/suggestions';
import type { Preferences, WorkoutLog } from '@/store/types';

const preferences: Preferences = {
  name: 'Test',
  focusStatement: '',
  hasCompletedOnboarding: true,
  notificationsEnabled: true,
  weekStartsOnMonday: true,
  goal: 'gain muscle',
  workoutPreferences: ['gym'],
  experienceLevel: 'intermediate',
};

describe('workout logic', () => {
  it('maps add and edit workout payloads including duration and user_id', () => {
    const payload = buildWorkoutInsertPayload('u1', {
      workoutType: 'gym',
      durationMinutes: 45.4,
      exerciseName: ' Squat ',
      sets: 3,
      reps: 8,
      weight: 135,
      notes: ' solid ',
      date: '2026-05-11',
    });
    expect(payload.workout).toEqual(
      expect.objectContaining({ user_id: 'u1', title: 'gym workout', workout_type: 'gym', duration_minutes: 45 })
    );
    expect(payload.entry).toEqual(expect.objectContaining({ user_id: 'u1', exercise_name: 'Squat', sets: 3 }));
    expect(buildWorkoutUpdatePayload({ workoutType: 'rest day', durationMinutes: 0 })).toEqual(
      expect.objectContaining({ title: 'Rest day', workout_type: 'rest day', duration_minutes: 0 })
    );
  });

  it('filters suggestions by goal, preference, and experience level', () => {
    const suggestions = getWorkoutSuggestions(preferences);
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions.every((workout) => workout.goalTags.includes('gain muscle'))).toBe(true);
    expect(suggestions.every((workout) => workout.preferenceTags.includes('gym'))).toBe(true);
    expect(suggestions.every((workout) => workout.experienceTags.includes('intermediate'))).toBe(true);
  });

  it('maps quick-add suggested workout to workout log payload', () => {
    const [suggestion] = getWorkoutSuggestions(preferences);
    const payload = workoutSuggestionToWorkoutInput(suggestion, '2026-05-11');
    expect(payload.workout).toEqual(
      expect.objectContaining({
        workout_type: suggestion.workoutType,
        duration_minutes: suggestion.durationMinutes,
        scheduled_for: '2026-05-11',
      })
    );
    expect(payload.entry).toEqual(expect.objectContaining({ exercise_name: expect.any(String) }));
  });

  it('groups workout history by date', () => {
    const workouts: WorkoutLog[] = [
      { id: '1', userId: 'u1', workoutType: 'gym', durationMinutes: 45, date: '2026-05-11', createdAt: 1 },
      { id: '2', userId: 'u1', workoutType: 'walking', durationMinutes: 30, date: '2026-05-10', createdAt: 2 },
    ];
    expect(Object.keys(groupByDate(workouts))).toEqual(['2026-05-11', '2026-05-10']);
  });
});
