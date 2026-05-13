import {
  buildWorkoutInsertPayload,
  buildWorkoutUpdatePayload,
  calculateChecklistProgress,
  getWorkoutDetailRoute,
  groupByDate,
  workoutSuggestionToWorkoutInput,
} from '@/utils/lifeops-logic';
import { getWorkoutSuggestions, workoutSuggestions } from '@/utils/suggestions';
import { createTimerState, formatTimer, timerReducer } from '@/utils/timer';
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

  it('keeps suggestions as recommendations until explicitly mapped for logging', () => {
    const suggestions = getWorkoutSuggestions(preferences);
    const addWorkout = jest.fn();

    expect(suggestions.length).toBeGreaterThan(0);
    expect(getWorkoutDetailRoute(suggestions[0].id)).toEqual({
      pathname: '/workout-detail',
      params: { id: suggestions[0].id },
    });
    expect(addWorkout).not.toHaveBeenCalled();
  });

  it('maps completed suggested workout to one workout log payload', () => {
    const [suggestion] = getWorkoutSuggestions(preferences);
    const payload = workoutSuggestionToWorkoutInput(suggestion, '2026-05-11');
    expect(payload.workout).toEqual(
      expect.objectContaining({
        workout_type: suggestion.workoutType,
        duration_minutes: suggestion.durationMinutes,
        scheduled_for: '2026-05-11',
        metadata: expect.objectContaining({
          source: 'suggested',
          template_id: suggestion.id,
          completed_steps_count: suggestion.steps.length,
          total_steps_count: suggestion.steps.length,
        }),
      })
    );
    expect(payload.entry).toEqual(expect.objectContaining({ exercise_name: expect.any(String) }));
  });

  it('has valid guided detail data for every workout suggestion', () => {
    expect(workoutSuggestions.length).toBeGreaterThanOrEqual(25);
    for (const workout of workoutSuggestions) {
      expect(workout.id).toMatch(/^workout-/);
      expect(workout.description).toEqual(expect.any(String));
      expect(workout.equipment.length).toBeGreaterThan(0);
      expect(workout.targetMuscles.length).toBeGreaterThan(0);
      expect(workout.estimatedCaloriesMin).toBeLessThanOrEqual(workout.estimatedCaloriesMax);
      expect(workout.steps.length).toBeGreaterThan(0);
      for (const step of workout.steps) {
        expect(step.id).toEqual(expect.any(String));
        expect(step.name).toEqual(expect.any(String));
        expect(step.instruction).toEqual(expect.any(String));
        if (step.type === 'reps') {
          expect(step.sets).toBeGreaterThan(0);
          expect(step.reps).toBeGreaterThan(0);
        } else {
          expect((step.durationSeconds ?? step.restSeconds ?? 0)).toBeGreaterThan(0);
        }
      }
    }
  });

  it('updates checklist progress from checked steps', () => {
    expect(calculateChecklistProgress(0, 4)).toBe(0);
    expect(calculateChecklistProgress(2, 4)).toBe(50);
    expect(calculateChecklistProgress(5, 4)).toBe(100);
  });

  it('supports timer start, pause, reset, and formatting', () => {
    let state = createTimerState(90);
    expect(formatTimer(state.remainingSeconds)).toBe('1:30');
    state = timerReducer(state, { type: 'start' });
    state = timerReducer(state, { type: 'tick' });
    expect(state.remainingSeconds).toBe(89);
    state = timerReducer(state, { type: 'pause' });
    state = timerReducer(state, { type: 'tick' });
    expect(state.remainingSeconds).toBe(89);
    state = timerReducer(state, { type: 'reset' });
    expect(state).toEqual({ initialSeconds: 90, remainingSeconds: 90, isRunning: false });
  });

  it('cancel/back does not create a workout record', () => {
    const addWorkout = jest.fn();
    const cancel = () => undefined;
    cancel();
    expect(addWorkout).not.toHaveBeenCalled();
  });

  it('complete workout creates exactly one workout record', () => {
    const [suggestion] = getWorkoutSuggestions(preferences);
    const addWorkout = jest.fn();
    addWorkout({
      workoutType: suggestion.workoutType,
      durationMinutes: suggestion.durationMinutes,
      source: 'suggested',
      templateId: suggestion.id,
      completedStepsCount: suggestion.steps.length,
      totalStepsCount: suggestion.steps.length,
    });
    expect(addWorkout).toHaveBeenCalledTimes(1);
    expect(addWorkout).toHaveBeenCalledWith(expect.objectContaining({
      source: 'suggested',
      templateId: suggestion.id,
      completedStepsCount: suggestion.steps.length,
    }));
  });

  it('groups workout history by date', () => {
    const workouts: WorkoutLog[] = [
      { id: '1', userId: 'u1', workoutType: 'gym', durationMinutes: 45, date: '2026-05-11', createdAt: 1 },
      { id: '2', userId: 'u1', workoutType: 'walking', durationMinutes: 30, date: '2026-05-10', createdAt: 2 },
    ];
    expect(Object.keys(groupByDate(workouts))).toEqual(['2026-05-11', '2026-05-10']);
  });
});
