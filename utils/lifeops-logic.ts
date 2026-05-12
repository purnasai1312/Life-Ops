import type {
  DailyActivitySummary,
  Goal,
  GoalCategory,
  GoalUnit,
  Habit,
  MealEntry,
  MealType,
  MoodEntry,
  MoodValue,
  OnboardingProfile,
  Preferences,
  WorkoutLog,
  WorkoutType,
} from '@/store/types';
import type { MealSuggestion, WorkoutSuggestion } from '@/utils/suggestions';
import { clampPercentage, calculateHabitPercentage, computeStreak } from './calculations';
import { GOAL_CATEGORY_META, HEALTH_GOAL_TEMPLATES } from './goals';

const todayISO = () => new Date().toISOString().slice(0, 10);

const requiredOnboardingFields: Array<keyof OnboardingProfile> = [
  'name',
  'age',
  'height',
  'weight',
  'goal',
  'activityLevel',
  'dietPreference',
  'experienceLevel',
  'calorieTarget',
  'proteinTarget',
  'waterTarget',
  'workoutFrequencyGoal',
  'movementGoal',
];

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value ?? fallback);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const roundNonNegative = (value: unknown) => Math.max(0, Math.round(toNumber(value)));

export function validateOnboardingProfile(profile: OnboardingProfile) {
  const errors: Partial<Record<keyof OnboardingProfile, string>> = {};
  for (const field of requiredOnboardingFields) {
    const value = profile[field];
    if (typeof value !== 'string' || !value.trim()) errors[field] = 'Required';
  }
  if (!profile.workoutPreferences?.length) errors.workoutPreferences = 'Choose at least one';
  if (!profile.habitPriorities?.length) errors.habitPriorities = 'Choose at least one';
  if (!profile.selectedGoals?.length) errors.selectedGoals = 'Choose at least one';
  return { valid: Object.keys(errors).length === 0, errors };
}

export function isOnboardingComplete(profile: OnboardingProfile) {
  return validateOnboardingProfile(profile).valid;
}

export function buildProfileUpsertPayload(userId: string, profile: OnboardingProfile) {
  const complete = isOnboardingComplete(profile);
  return {
    id: userId,
    name: profile.name.trim(),
    age: roundNonNegative(profile.age),
    height: profile.height.trim(),
    weight: profile.weight.trim(),
    goal: profile.goal,
    activity_level: profile.activityLevel,
    diet_preference: profile.dietPreference,
    workout_preference: profile.workoutPreferences[0] ?? profile.workoutPreference,
    workout_preferences: profile.workoutPreferences,
    experience_level: profile.experienceLevel,
    calorie_target: roundNonNegative(profile.calorieTarget),
    protein_target: roundNonNegative(profile.proteinTarget),
    water_target: roundNonNegative(profile.waterTarget),
    workout_frequency_goal: roundNonNegative(profile.workoutFrequencyGoal),
    movement_goal: roundNonNegative(profile.movementGoal),
    habit_priorities: profile.habitPriorities,
    selected_goals: profile.selectedGoals,
    habits: profile.habits,
    intentions: profile.intentions,
    focus_statement: profile.focusStatement.trim(),
    has_completed_onboarding: complete,
  };
}

export function buildOnboardingUpsertPayload(userId: string, profile: OnboardingProfile) {
  return {
    user_id: userId,
    age: roundNonNegative(profile.age),
    height: profile.height.trim(),
    weight: profile.weight.trim(),
    goal: profile.goal,
    activity_level: profile.activityLevel,
    diet_preference: profile.dietPreference,
    workout_preference: profile.workoutPreferences[0] ?? profile.workoutPreference,
    workout_preferences: profile.workoutPreferences,
    experience_level: profile.experienceLevel,
    calorie_target: roundNonNegative(profile.calorieTarget),
    protein_target: roundNonNegative(profile.proteinTarget),
    water_target: roundNonNegative(profile.waterTarget),
    workout_frequency_goal: roundNonNegative(profile.workoutFrequencyGoal),
    movement_goal: roundNonNegative(profile.movementGoal),
    habit_priorities: profile.habitPriorities,
    selected_goals: profile.selectedGoals,
    habits: profile.habits,
    intentions: profile.intentions,
    focus_statement: profile.focusStatement.trim(),
    completed_at: isOnboardingComplete(profile) ? expectAnyIsoTimestamp() : null,
  };
}

function expectAnyIsoTimestamp() {
  return new Date().toISOString();
}

export function selectedGoalsToGoalRecords(userId: string, selectedGoalKeys: string[], preferences: Preferences) {
  return HEALTH_GOAL_TEMPLATES.filter((template) => selectedGoalKeys.includes(template.key)).map((template) => ({
    user_id: userId,
    title: template.title,
    description: template.description,
    color: template.color,
    category: template.category,
    target_unit: template.unit,
    target:
      template.key === 'protein'
        ? roundNonNegative(preferences.proteinTarget || template.target)
        : template.key === 'calories'
          ? roundNonNegative(preferences.calorieTarget || template.target)
          : template.key === 'water'
            ? roundNonNegative(preferences.waterTarget || template.target)
            : template.key === 'walking'
              ? roundNonNegative(preferences.movementGoal || template.target)
              : template.key === 'workouts' || template.key === 'muscle'
                ? roundNonNegative(preferences.workoutFrequencyGoal || template.target)
                : template.target,
    progress: 0,
  }));
}

export function buildMealInsertPayload(userId: string, input: {
  mealType: MealType;
  foodName: string;
  calories?: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
  notes?: string;
  date?: string;
}) {
  return {
    user_id: userId,
    name: input.foodName.trim(),
    description: input.notes?.trim() || null,
    meal_type: input.mealType,
    meal_date: input.date || todayISO(),
    calories: toNumber(input.calories),
    protein_g: toNumber(input.proteinG),
    carbs_g: toNumber(input.carbsG),
    fat_g: toNumber(input.fatG),
  };
}

export function buildMealUpdatePayload(input: Partial<MealEntry>) {
  return {
    name: input.foodName?.trim(),
    description: input.notes?.trim() || null,
    meal_type: input.mealType,
    meal_date: input.date,
    calories: input.calories,
    protein_g: input.proteinG,
    carbs_g: input.carbsG,
    fat_g: input.fatG,
  };
}

export function calculateMealTotals(meals: MealEntry[]) {
  return meals.reduce(
    (totals, meal) => ({
      calories: totals.calories + toNumber(meal.calories),
      proteinG: totals.proteinG + toNumber(meal.proteinG),
      carbsG: totals.carbsG + toNumber(meal.carbsG),
      fatG: totals.fatG + toNumber(meal.fatG),
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 }
  );
}

export function groupByDate<T extends { date: string }>(items: T[]) {
  return items.reduce<Record<string, T[]>>((groups, item) => {
    groups[item.date] = [...(groups[item.date] ?? []), item];
    return groups;
  }, {});
}

export function mealSuggestionToMealInput(suggestion: MealSuggestion, date = todayISO()) {
  return buildMealInsertPayload('', {
    mealType: suggestion.mealType,
    foodName: suggestion.title,
    calories: suggestion.calories,
    proteinG: suggestion.proteinG,
    carbsG: suggestion.carbsG,
    fatG: suggestion.fatG,
    notes: suggestion.notes,
    date,
  });
}

export function buildWorkoutInsertPayload(userId: string, input: {
  workoutType: WorkoutType;
  durationMinutes?: number;
  exerciseName?: string;
  sets?: number;
  reps?: number;
  weight?: number;
  notes?: string;
  date?: string;
}) {
  return {
    workout: {
      user_id: userId,
      title: input.workoutType === 'rest day' ? 'Rest day' : `${input.workoutType} workout`,
      workout_type: input.workoutType,
      scheduled_for: input.date || todayISO(),
      duration_minutes: roundNonNegative(input.durationMinutes),
      notes: input.notes?.trim() || null,
    },
    entry: input.exerciseName?.trim()
      ? {
          user_id: userId,
          exercise_name: input.exerciseName.trim(),
          sets: input.sets,
          reps: input.reps,
          weight: input.weight,
        }
      : null,
  };
}

export function buildWorkoutUpdatePayload(input: Partial<WorkoutLog>) {
  return {
    title: input.workoutType ? (input.workoutType === 'rest day' ? 'Rest day' : `${input.workoutType} workout`) : undefined,
    workout_type: input.workoutType,
    scheduled_for: input.date,
    duration_minutes: input.durationMinutes,
    notes: input.notes?.trim() || null,
  };
}

export function workoutSuggestionToWorkoutInput(suggestion: WorkoutSuggestion, date = todayISO()) {
  return buildWorkoutInsertPayload('', {
    workoutType: suggestion.workoutType,
    durationMinutes: suggestion.durationMinutes,
    exerciseName: suggestion.exerciseName ?? suggestion.title,
    sets: suggestion.sets,
    reps: suggestion.reps,
    notes: suggestion.notes,
    date,
  });
}

export function buildHabitInsertPayload(userId: string, input: Pick<Habit, 'title' | 'icon' | 'color' | 'cadence'>) {
  return {
    user_id: userId,
    title: input.title.trim(),
    icon: input.icon,
    color: input.color,
    cadence: input.cadence,
  };
}

export function buildHabitLogPayload(userId: string, habitId: string, date: string) {
  return {
    user_id: userId,
    habit_id: habitId,
    log_date: date,
    completed: true,
  };
}

export function toggleHabitCompletion(completions: Record<string, boolean>, date: string) {
  const next = { ...completions };
  if (next[date]) delete next[date];
  else next[date] = true;
  return next;
}

export function getHabitCompletionSummary(habits: Habit[], date: string) {
  const completed = habits.filter((habit) => habit.completions[date]).length;
  return {
    completed,
    total: habits.length,
    percentage: calculateHabitPercentage(completed, habits.length),
  };
}

export function buildHabitDeleteFilter(userId: string, habitId: string) {
  return { user_id: userId, id: habitId };
}

export function buildReflectionPayload(userId: string, input: { value: MoodValue | number | null; note?: string; date?: string }) {
  return {
    user_id: userId,
    reflection_date: input.date || todayISO(),
    mood_value: sanitizeMoodValue(input.value),
    note: input.note?.trim() || null,
  };
}

export function sanitizeMoodValue(value: MoodValue | number | null | undefined): MoodValue {
  const rounded = Math.round(toNumber(value, 3));
  return Math.max(1, Math.min(5, rounded)) as MoodValue;
}

export function hasCheckInToday(entries: MoodEntry[], today: string) {
  return entries.some((entry) => entry.date === today);
}

export const HEALTH_SYNC_UNAVAILABLE_MESSAGE =
  'Health sync is unavailable in this version. You can still add activity manually.';

export function buildManualActivityPayload(userId: string, activity: DailyActivitySummary) {
  return {
    user_id: userId,
    date: activity.date,
    source: 'manual' as const,
    steps: roundNonNegative(activity.steps),
    calories_burned: roundNonNegative(activity.caloriesBurned),
    active_minutes: roundNonNegative(activity.activeMinutes),
    exercise_minutes: roundNonNegative(activity.exerciseMinutes),
    distance_meters: roundNonNegative(activity.distanceMeters),
    workouts_count: roundNonNegative(activity.workoutsCount),
    sleep_minutes: activity.sleepMinutes == null ? null : roundNonNegative(activity.sleepMinutes),
    avg_heart_rate: activity.avgHeartRate == null ? null : roundNonNegative(activity.avgHeartRate),
    synced_at: activity.syncedAt ?? expectAnyIsoTimestamp(),
  };
}

export function calculateActivitySummary(activity: DailyActivitySummary | undefined, movementGoal: number) {
  return {
    steps: activity?.steps ?? 0,
    caloriesBurned: activity?.caloriesBurned ?? 0,
    activeMinutes: activity?.activeMinutes ?? 0,
    workoutsCount: activity?.workoutsCount ?? 0,
    stepsPercentage: clampPercentage(movementGoal > 0 ? ((activity?.steps ?? 0) / movementGoal) * 100 : 0),
  };
}

export function calculateDashboardState(input: {
  meals?: MealEntry[];
  workouts?: WorkoutLog[];
  habits?: Habit[];
  reflections?: MoodEntry[];
  activity?: DailyActivitySummary;
  today: string;
  calorieTarget?: number | string | null;
  proteinTarget?: number | string | null;
  movementGoal?: number | string | null;
}) {
  const meals = input.meals ?? [];
  const totals = calculateMealTotals(meals.filter((meal) => meal.date === input.today));
  const caloriePercentage = clampPercentage(toNumber(input.calorieTarget) > 0 ? (totals.calories / toNumber(input.calorieTarget)) * 100 : 0);
  const proteinPercentage = clampPercentage(toNumber(input.proteinTarget) > 0 ? (totals.proteinG / toNumber(input.proteinTarget)) * 100 : 0);
  const habitSummary = getHabitCompletionSummary(input.habits ?? [], input.today);
  const workoutLogged = (input.workouts ?? []).some((workout) => workout.date === input.today && workout.workoutType !== 'rest day');
  const reflectionLogged = hasCheckInToday(input.reflections ?? [], input.today);
  const activitySummary = calculateActivitySummary(input.activity, toNumber(input.movementGoal));
  return {
    calories: totals.calories,
    proteinG: totals.proteinG,
    caloriePercentage,
    proteinPercentage,
    habitPercentage: habitSummary.percentage,
    workoutLogged,
    reflectionLogged,
    activitySummary,
  };
}

export function buildProfileUpdatePayload(userId: string, preferences: Partial<Preferences>) {
  return {
    id: userId,
    name: preferences.name?.trim() || null,
    goal: preferences.goal?.trim() || null,
    diet_preference: preferences.dietPreference?.trim() || null,
    workout_preference: preferences.workoutPreferences?.[0] ?? preferences.workoutPreference ?? null,
    workout_preferences: preferences.workoutPreferences ?? (preferences.workoutPreference ? [preferences.workoutPreference] : []),
    habit_priorities: preferences.habitPriorities ?? [],
    selected_goals: preferences.selectedGoals ?? [],
  };
}

export function isMissingAuthSessionError(error: unknown) {
  const name = (error as { name?: string } | null)?.name ?? '';
  const message = (error as { message?: string } | null)?.message ?? '';
  return name === 'AuthSessionMissingError' || /auth session missing/i.test(message);
}

export async function safeLogoutFlow(input: {
  getSession: () => Promise<{ data?: { session?: unknown | null }; error?: unknown }>;
  signOut: () => Promise<{ error?: unknown }>;
  clearLocal: () => Promise<void>;
}) {
  const { data, error } = await input.getSession();
  if (error && !isMissingAuthSessionError(error)) throw error;
  if (data?.session) {
    const result = await input.signOut();
    if (result.error && !isMissingAuthSessionError(result.error)) throw result.error;
  }
  await input.clearLocal();
  return { session: null };
}

export function getCategoryUnits(category: GoalCategory): GoalUnit[] {
  return GOAL_CATEGORY_META[category].units;
}

export function getCategoryIcon(category: GoalCategory) {
  return GOAL_CATEGORY_META[category].icon;
}

export function isEmojiIcon(icon: string) {
  return /\p{Extended_Pictographic}/u.test(icon);
}

export function calculateGoalProgress(goal: Pick<Goal, 'progress' | 'target'>) {
  return clampPercentage(goal.target > 0 ? (goal.progress / goal.target) * 100 : 0);
}
