import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isMissingSupabaseTableError, supabase } from '@/lib/supabase';
import type {
  Habit,
  Task,
  Goal,
  GoalCategory,
  GoalUnit,
  DailyActivitySummary,
  MoodEntry,
  MealEntry,
  MealType,
  OnboardingProfile,
  Preferences,
  WorkoutLog,
  WorkoutType,
  AccentColor,
  HabitCadence,
  MoodValue,
} from './types';
import type { GoalTemplate } from '@/utils/goals';
import * as healthSync from '@/healthSync';

const todayISO = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const daysAgoISO = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const uid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const asNumber = (value: unknown) => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const parseWeightLb = (weight?: string) => {
  const raw = Number(String(weight ?? '').replace(/[^\d.]/g, ''));
  if (!Number.isFinite(raw) || raw <= 0) return 160;
  return /kg/i.test(weight ?? '') ? raw * 2.20462 : raw;
};

const getCurrentUserId = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw error ?? new Error('No authenticated user.');
  return data.user.id;
};

const isProfileComplete = (preferences: Preferences) =>
  Boolean(
    preferences.userId &&
      preferences.hasCompletedOnboarding &&
      preferences.name?.trim() &&
      preferences.age &&
      preferences.height?.trim() &&
      preferences.weight?.trim() &&
      preferences.goal?.trim() &&
      preferences.activityLevel?.trim() &&
      preferences.dietPreference?.trim() &&
      (preferences.workoutPreferences?.length || preferences.workoutPreference?.trim()) &&
      preferences.experienceLevel?.trim() &&
      preferences.calorieTarget &&
      preferences.proteinTarget &&
      preferences.waterTarget &&
      preferences.workoutFrequencyGoal &&
      preferences.movementGoal
  );

const toTimestamp = (value: string | null | undefined) =>
  value ? new Date(value).getTime() : Date.now();

interface AppState {
  preferences: Preferences;
  habits: Habit[];
  tasks: Task[];
  goals: Goal[];
  moods: MoodEntry[];
  meals: MealEntry[];
  workouts: WorkoutLog[];
  dailyActivity: DailyActivitySummary[];
  dashboardSummary: {
    completedHabits: number;
    totalHabits: number;
    goalProgress: number;
    dailyScore?: number;
  };
  isSyncing: boolean;
  syncError?: string;

  // Preferences
  completeOnboarding: (profile: OnboardingProfile) => void;
  updatePreferences: (partial: Partial<Preferences>) => void;
  loadProfile: () => Promise<void>;
  saveProfile: (partial: Partial<Preferences>) => Promise<void>;
  resetAll: () => void;
  resetOnboardingForTesting: () => Promise<void>;

  // Habits
  addHabit: (input: {
    title: string;
    icon: string;
    color: AccentColor;
    cadence: HabitCadence;
  }) => void;
  toggleHabitToday: (habitId: string) => void;
  deleteHabit: (habitId: string) => void;

  // Tasks
  addTask: (input: { title: string; note?: string; date?: string }) => void;
  toggleTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;

  // Goals
  addGoal: (input: {
    title: string;
    description?: string;
    color: AccentColor;
    category?: GoalCategory;
    unit?: GoalUnit;
    target: number;
    dueDate?: string;
  }) => Promise<void>;
  addGoalTemplates: (templates: GoalTemplate[]) => Promise<void>;
  loadGoals: () => Promise<void>;
  incrementGoal: (goalId: string, delta: number) => Promise<void>;
  deleteGoal: (goalId: string) => Promise<void>;

  // Mood
  loadReflections: () => Promise<void>;
  logMood: (value: MoodValue, note?: string) => Promise<void>;

  // Meals
  loadMeals: () => Promise<void>;
  addMeal: (input: {
    mealType: MealType;
    foodName: string;
    calories?: number;
    proteinG?: number;
    carbsG?: number;
    fatG?: number;
    notes?: string;
    date?: string;
  }) => Promise<void>;
  updateMeal: (id: string, input: Partial<Omit<MealEntry, 'id' | 'userId' | 'createdAt'>>) => Promise<void>;
  deleteMeal: (id: string) => Promise<void>;

  // Workouts
  loadWorkouts: () => Promise<void>;
  addWorkout: (input: {
    workoutType: WorkoutType;
    durationMinutes?: number;
    exerciseName?: string;
    sets?: number;
    reps?: number;
    weight?: number;
    notes?: string;
    date?: string;
  }) => Promise<void>;
  updateWorkout: (id: string, input: Partial<Omit<WorkoutLog, 'id' | 'userId' | 'createdAt'>>) => Promise<void>;
  deleteWorkout: (id: string) => Promise<void>;

  loadDashboardSummary: () => Promise<void>;
  loadDailyActivity: () => Promise<void>;
  saveDailyActivity: (activity: DailyActivitySummary) => Promise<void>;
  syncDailyActivity: (date?: string) => Promise<void>;
  loadCoreData: () => Promise<void>;
}

const defaultPreferences: Preferences = {
  name: '',
  focusStatement: '',
  hasCompletedOnboarding: false,
  notificationsEnabled: true,
  weekStartsOnMonday: true,
};

/** Compute streak given completions map and cadence (daily only for now). */
const computeStreak = (completions: Record<string, boolean>): number => {
  let streak = 0;
  const d = new Date();
  // Count back day-by-day while the current day is marked true.
  // If today isn't done yet, start from yesterday so the streak isn't lost.
  const today = todayISO();
  if (!completions[today]) {
    d.setDate(d.getDate() - 1);
  }
  while (true) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const key = `${y}-${m}-${day}`;
    if (completions[key]) {
      streak += 1;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      preferences: defaultPreferences,
      habits: [],
      tasks: [],
      goals: [],
      moods: [],
      meals: [],
      workouts: [],
      dailyActivity: [],
      dashboardSummary: {
        completedHabits: 0,
        totalHabits: 0,
        goalProgress: 0,
      },
      isSyncing: false,

      completeOnboarding: (profile) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            userId: profile.userId,
            name: profile.name.trim(),
            focusStatement: profile.focusStatement.trim(),
            age: profile.age.trim(),
            height: profile.height.trim(),
            weight: profile.weight.trim(),
            goal: profile.goal,
            activityLevel: profile.activityLevel,
            dietPreference: profile.dietPreference,
            workoutPreference: profile.workoutPreference,
            workoutPreferences: profile.workoutPreferences,
            experienceLevel: profile.experienceLevel,
            calorieTarget: profile.calorieTarget,
            proteinTarget: profile.proteinTarget,
            waterTarget: profile.waterTarget,
            workoutFrequencyGoal: profile.workoutFrequencyGoal,
            movementGoal: profile.movementGoal,
            habitPriorities: profile.habitPriorities,
            selectedGoals: profile.selectedGoals,
            habits: profile.habits,
            intentions: profile.intentions,
            hasCompletedOnboarding: true,
          },
        })),

      updatePreferences: (partial) =>
        set((state) => ({
          preferences: { ...state.preferences, ...partial },
        })),

      loadProfile: async () => {
        set({ isSyncing: true, syncError: undefined });
        try {
          const userId = await getCurrentUserId();
          const { data, error } = await supabase
            .from('profiles')
            .select(
              'id,name,age,height,weight,goal,activity_level,diet_preference,workout_preference,workout_preferences,experience_level,calorie_target,protein_target,water_target,workout_frequency_goal,movement_goal,habit_priorities,selected_goals,habits,intentions,focus_statement,has_completed_onboarding,notifications_enabled,week_starts_on_monday'
            )
            .eq('id', userId)
            .maybeSingle();
          if (error) throw error;
          if (!data) {
            set((state) => ({
              preferences: {
                ...defaultPreferences,
                name: state.preferences.userId === userId ? state.preferences.name : '',
                userId,
                hasCompletedOnboarding: false,
              },
              habits: state.preferences.userId === userId ? state.habits : [],
              tasks: state.preferences.userId === userId ? state.tasks : [],
              goals: state.preferences.userId === userId ? state.goals : [],
              moods: state.preferences.userId === userId ? state.moods : [],
              meals: state.preferences.userId === userId ? state.meals : [],
              workouts: state.preferences.userId === userId ? state.workouts : [],
              dailyActivity: state.preferences.userId === userId ? state.dailyActivity : [],
            }));
            return;
          }
          set((state) => ({
            preferences: {
              ...state.preferences,
              userId,
              name: data.name ?? state.preferences.name,
              age: data.age == null ? undefined : String(data.age),
              height: data.height ?? undefined,
              weight: data.weight ?? undefined,
              goal: data.goal ?? undefined,
              activityLevel: data.activity_level ?? undefined,
              dietPreference: data.diet_preference ?? undefined,
              workoutPreference: data.workout_preference ?? undefined,
              workoutPreferences: data.workout_preferences ?? (data.workout_preference ? [data.workout_preference] : undefined),
              experienceLevel: data.experience_level ?? undefined,
              calorieTarget: data.calorie_target == null ? undefined : String(data.calorie_target),
              proteinTarget: data.protein_target == null ? undefined : String(data.protein_target),
              waterTarget: data.water_target == null ? undefined : String(data.water_target),
              workoutFrequencyGoal: data.workout_frequency_goal == null ? undefined : String(data.workout_frequency_goal),
              movementGoal: data.movement_goal == null ? undefined : String(data.movement_goal),
              habitPriorities: data.habit_priorities ?? undefined,
              selectedGoals: data.selected_goals ?? undefined,
              habits: data.habits ?? undefined,
              intentions: data.intentions ?? undefined,
              focusStatement: data.focus_statement ?? '',
              hasCompletedOnboarding: !!data.has_completed_onboarding,
              notificationsEnabled: data.notifications_enabled ?? true,
              weekStartsOnMonday: data.week_starts_on_monday ?? true,
            },
            habits: state.preferences.userId && state.preferences.userId !== userId ? [] : state.habits,
            tasks: state.preferences.userId && state.preferences.userId !== userId ? [] : state.tasks,
            goals: state.preferences.userId && state.preferences.userId !== userId ? [] : state.goals,
            moods: state.preferences.userId && state.preferences.userId !== userId ? [] : state.moods,
            meals: state.preferences.userId && state.preferences.userId !== userId ? [] : state.meals,
            workouts: state.preferences.userId && state.preferences.userId !== userId ? [] : state.workouts,
            dailyActivity: state.preferences.userId && state.preferences.userId !== userId ? [] : state.dailyActivity,
          }));
        } catch (error) {
          if (!isMissingSupabaseTableError(error)) {
            set({ syncError: (error as Error).message });
          }
        } finally {
          set({ isSyncing: false });
        }
      },

      saveProfile: async (partial) => {
        set({ isSyncing: true, syncError: undefined });
        try {
          const userId = await getCurrentUserId();
          const next = { ...useAppStore.getState().preferences, ...partial };
          const age = next.age ? Math.max(0, Math.min(130, Math.round(Number(next.age)))) : null;
          const profile = {
            id: userId,
            name: next.name?.trim() || null,
            age: Number.isFinite(age) ? age : null,
            height: next.height?.trim() || null,
            weight: next.weight?.trim() || null,
            goal: next.goal?.trim() || null,
            activity_level: next.activityLevel?.trim() || null,
            diet_preference: next.dietPreference?.trim() || null,
            workout_preference: next.workoutPreference?.trim() || null,
            workout_preferences: next.workoutPreferences ?? (next.workoutPreference ? [next.workoutPreference] : []),
            experience_level: next.experienceLevel?.trim() || null,
            calorie_target: next.calorieTarget ? Number(next.calorieTarget) || null : null,
            protein_target: next.proteinTarget ? Number(next.proteinTarget) || null : null,
            water_target: next.waterTarget ? Number(next.waterTarget) || null : null,
            workout_frequency_goal: next.workoutFrequencyGoal ? Number(next.workoutFrequencyGoal) || null : null,
            movement_goal: next.movementGoal ? Number(next.movementGoal) || null : null,
            habit_priorities: next.habitPriorities ?? [],
            selected_goals: next.selectedGoals ?? [],
            focus_statement: next.focusStatement?.trim() || null,
            has_completed_onboarding: isProfileComplete({ ...next, userId }),
          };
          const { error: profileError } = await supabase.from('profiles').upsert(profile);
          if (profileError) throw profileError;
          const { error: onboardingError } = await supabase.from('onboarding').upsert(
            {
              user_id: userId,
              age: profile.age,
              height: profile.height,
              weight: profile.weight,
              goal: profile.goal,
              activity_level: profile.activity_level,
              diet_preference: profile.diet_preference,
              workout_preference: profile.workout_preference,
              workout_preferences: profile.workout_preferences,
              experience_level: profile.experience_level,
              calorie_target: profile.calorie_target,
              protein_target: profile.protein_target,
              water_target: profile.water_target,
              workout_frequency_goal: profile.workout_frequency_goal,
              movement_goal: profile.movement_goal,
              habit_priorities: profile.habit_priorities,
              selected_goals: profile.selected_goals,
              focus_statement: profile.focus_statement,
              habits: next.habits ?? [],
              intentions: next.intentions ?? [],
              completed_at: profile.has_completed_onboarding ? new Date().toISOString() : null,
            },
            { onConflict: 'user_id' }
          );
          if (onboardingError && !isMissingSupabaseTableError(onboardingError)) {
            throw onboardingError;
          }
          set((state) => ({
            preferences: {
              ...state.preferences,
              ...partial,
              userId,
              hasCompletedOnboarding: profile.has_completed_onboarding,
            },
          }));
        } catch (error) {
          set({ syncError: (error as Error).message });
          throw error;
        } finally {
          set({ isSyncing: false });
        }
      },

      resetAll: () =>
        set(() => ({
          preferences: defaultPreferences,
          habits: [],
          tasks: [],
          goals: [],
          moods: [],
          meals: [],
          workouts: [],
          dailyActivity: [],
          dashboardSummary: {
            completedHabits: 0,
            totalHabits: 0,
            goalProgress: 0,
          },
          syncError: undefined,
        })),

      resetOnboardingForTesting: async () => {
        const userId = await getCurrentUserId();
        await supabase
          .from('profiles')
          .update({ has_completed_onboarding: false })
          .eq('id', userId);
        await supabase
          .from('onboarding')
          .update({ completed_at: null })
          .eq('user_id', userId);
        set((state) => ({
          preferences: {
            ...state.preferences,
            userId,
            hasCompletedOnboarding: false,
          },
        }));
      },

      addHabit: ({ title, icon, color, cadence }) =>
        set((state) => ({
          habits: [
            ...state.habits,
            {
              id: uid(),
              title: title.trim(),
              icon,
              color,
              cadence,
              createdAt: Date.now(),
              completions: {},
              streak: 0,
            },
          ],
        })),

      toggleHabitToday: (habitId) =>
        set((state) => ({
          habits: state.habits.map((h) => {
            if (h.id !== habitId) return h;
            const key = todayISO();
            const completions = { ...h.completions };
            if (completions[key]) {
              delete completions[key];
            } else {
              completions[key] = true;
            }
            return {
              ...h,
              completions,
              streak: computeStreak(completions),
            };
          }),
        })),

      deleteHabit: (habitId) =>
        set((state) => ({
          habits: state.habits.filter((h) => h.id !== habitId),
        })),

      addTask: ({ title, note, date }) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              id: uid(),
              title: title.trim(),
              note: note?.trim() || undefined,
              done: false,
              date: date || todayISO(),
              createdAt: Date.now(),
            },
          ],
        })),

      toggleTask: (taskId) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, done: !t.done } : t
          ),
        })),

      deleteTask: (taskId) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== taskId),
        })),

      loadGoals: async () => {
        try {
          const userId = await getCurrentUserId();
          const { data, error } = await supabase
            .from('goals')
            .select('id,user_id,title,description,color,category,target_unit,target,progress,due_date,created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: true });
          if (error) throw error;
          set({
            goals: (data ?? []).map((row) => ({
              id: row.id,
              userId: row.user_id,
              title: row.title,
              description: row.description ?? undefined,
              color: (row.color ?? 'accent') as AccentColor,
              category: (row.category ?? 'custom') as GoalCategory,
              unit: (row.target_unit ?? 'count') as GoalUnit,
              target: row.target,
              progress: row.progress,
              dueDate: row.due_date ?? undefined,
              createdAt: toTimestamp(row.created_at),
            })),
          });
        } catch (error) {
          if (!isMissingSupabaseTableError(error)) set({ syncError: (error as Error).message });
        }
      },

      addGoal: async ({ title, description, color, category = 'custom', unit = 'count', target, dueDate }) => {
        const userId = await getCurrentUserId();
        const { data, error } = await supabase
          .from('goals')
          .insert({
            user_id: userId,
            title: title.trim(),
            description: description?.trim() || null,
            color,
            category,
            target_unit: unit,
            target,
            progress: 0,
            due_date: dueDate ?? null,
          })
          .select('id,user_id,title,description,color,category,target_unit,target,progress,due_date,created_at')
          .single();
        if (error) throw error;
        const goal: Goal = {
          id: data.id,
          userId: data.user_id,
          title: data.title,
          description: data.description ?? undefined,
          color: (data.color ?? color) as AccentColor,
          category: (data.category ?? category) as GoalCategory,
          unit: (data.target_unit ?? unit) as GoalUnit,
          target: data.target,
          progress: data.progress,
          dueDate: data.due_date ?? undefined,
          createdAt: toTimestamp(data.created_at),
        };
        set((state) => ({ goals: [...state.goals, goal] }));
      },

      addGoalTemplates: async (templates) => {
        const state = useAppStore.getState();
        for (const template of templates) {
          if (state.goals.some((goal) => goal.title === template.title)) continue;
          await useAppStore.getState().addGoal({
            title: template.title,
            description: template.description,
            color: template.color,
            category: template.category,
            unit: template.unit,
            target: template.target,
          });
        }
      },

      incrementGoal: async (goalId, delta) => {
        const userId = await getCurrentUserId();
        const current = useAppStore.getState().goals.find((g) => g.id === goalId);
        if (!current) return;
        const progress = Math.max(0, Math.min(current.target, current.progress + delta));
        const { error } = await supabase
          .from('goals')
          .update({ progress })
          .eq('id', goalId)
          .eq('user_id', userId);
        if (error) throw error;
        set((state) => ({
          goals: state.goals.map((g) => (g.id === goalId ? { ...g, progress } : g)),
        }));
      },

      deleteGoal: async (goalId) => {
        const userId = await getCurrentUserId();
        const { error } = await supabase.from('goals').delete().eq('id', goalId).eq('user_id', userId);
        if (error) throw error;
        set((state) => ({
          goals: state.goals.filter((g) => g.id !== goalId),
        }));
      },

      loadReflections: async () => {
        set({ isSyncing: true, syncError: undefined });
        try {
          const userId = await getCurrentUserId();
          const { data, error } = await supabase
            .from('reflections')
            .select('id,reflection_date,mood_value,note,created_at')
            .eq('user_id', userId)
            .gte('reflection_date', daysAgoISO(29))
            .order('reflection_date', { ascending: false })
            .limit(30);
          if (error) throw error;
          set({
            moods: (data ?? [])
              .filter((row) => row.mood_value >= 1 && row.mood_value <= 5)
              .map((row) => ({
                id: row.id,
                date: row.reflection_date,
                value: row.mood_value as MoodValue,
                note: row.note ?? undefined,
                createdAt: toTimestamp(row.created_at),
              })),
          });
        } catch (error) {
          if (!isMissingSupabaseTableError(error)) {
            set({ syncError: (error as Error).message });
          }
        } finally {
          set({ isSyncing: false });
        }
      },

      logMood: async (value, note) => {
        const date = todayISO();
        try {
          const userId = await getCurrentUserId();
          const { data, error } = await supabase
            .from('reflections')
            .upsert(
              {
                user_id: userId,
                reflection_date: date,
                mood_value: value,
                note: note?.trim() || null,
              },
              { onConflict: 'user_id,reflection_date' }
            )
            .select('id,reflection_date,mood_value,note,created_at')
            .single();
          if (error) throw error;
          const entry: MoodEntry = {
            id: data.id,
            date: data.reflection_date,
            value: data.mood_value as MoodValue,
            note: data.note ?? undefined,
            createdAt: toTimestamp(data.created_at),
          };
          set((state) => ({
            moods: state.moods.some((m) => m.date === date)
              ? state.moods.map((m) => (m.date === date ? entry : m))
              : [...state.moods, entry],
          }));
          return;
        } catch (error) {
          if (!isMissingSupabaseTableError(error)) {
            set({ syncError: (error as Error).message });
            throw error;
          }
        }
        set((state) => {
          const date = todayISO();
          const existing = state.moods.find((m) => m.date === date);
          if (existing) {
            return {
              moods: state.moods.map((m) =>
                m.date === date ? { ...m, value, note: note?.trim() || undefined } : m
              ),
            };
          }
          return {
            moods: [
              ...state.moods,
              {
                id: uid(),
                date,
                value,
                note: note?.trim() || undefined,
                createdAt: Date.now(),
              },
            ],
          };
        });
      },

      loadMeals: async () => {
        set({ isSyncing: true, syncError: undefined });
        try {
          const userId = await getCurrentUserId();
          const { data, error } = await supabase
            .from('meals')
            .select('id,user_id,name,description,meal_type,meal_date,calories,protein_g,carbs_g,fat_g,created_at')
            .eq('user_id', userId)
            .gte('meal_date', daysAgoISO(29))
            .order('meal_date', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(60);
          if (error) throw error;
          set({
            meals: (data ?? []).map((row) => ({
              id: row.id,
              userId: row.user_id,
              mealType: (row.meal_type ?? 'snack') as MealType,
              foodName: row.name,
              calories: asNumber(row.calories),
              proteinG: asNumber(row.protein_g),
              carbsG: asNumber(row.carbs_g),
              fatG: asNumber(row.fat_g),
              notes: row.description ?? undefined,
              date: row.meal_date,
              createdAt: toTimestamp(row.created_at),
            })),
          });
        } catch (error) {
          if (!isMissingSupabaseTableError(error)) {
            set({ syncError: (error as Error).message });
          }
        } finally {
          set({ isSyncing: false });
        }
      },

      addMeal: async (input) => {
        const userId = await getCurrentUserId();
        const { data, error } = await supabase
          .from('meals')
          .insert({
            user_id: userId,
            name: input.foodName.trim(),
            description: input.notes?.trim() || null,
            meal_type: input.mealType,
            meal_date: input.date || todayISO(),
            calories: input.calories ?? 0,
            protein_g: input.proteinG ?? 0,
            carbs_g: input.carbsG ?? 0,
            fat_g: input.fatG ?? 0,
          })
          .select('id,user_id,name,description,meal_type,meal_date,calories,protein_g,carbs_g,fat_g,created_at')
          .single();
        if (error) throw error;
        const meal: MealEntry = {
          id: data.id,
          userId: data.user_id,
          mealType: data.meal_type as MealType,
          foodName: data.name,
          calories: asNumber(data.calories),
          proteinG: asNumber(data.protein_g),
          carbsG: asNumber(data.carbs_g),
          fatG: asNumber(data.fat_g),
          notes: data.description ?? undefined,
          date: data.meal_date,
          createdAt: toTimestamp(data.created_at),
        };
        set((state) => ({ meals: [meal, ...state.meals] }));
      },

      updateMeal: async (id, input) => {
        const userId = await getCurrentUserId();
        const { data, error } = await supabase
          .from('meals')
          .update({
            name: input.foodName?.trim(),
            description: input.notes?.trim() || null,
            meal_type: input.mealType,
            meal_date: input.date,
            calories: input.calories,
            protein_g: input.proteinG,
            carbs_g: input.carbsG,
            fat_g: input.fatG,
          })
          .eq('id', id)
          .eq('user_id', userId)
          .select('id,user_id,name,description,meal_type,meal_date,calories,protein_g,carbs_g,fat_g,created_at')
          .single();
        if (error) throw error;
        const meal: MealEntry = {
          id: data.id,
          userId: data.user_id,
          mealType: data.meal_type as MealType,
          foodName: data.name,
          calories: asNumber(data.calories),
          proteinG: asNumber(data.protein_g),
          carbsG: asNumber(data.carbs_g),
          fatG: asNumber(data.fat_g),
          notes: data.description ?? undefined,
          date: data.meal_date,
          createdAt: toTimestamp(data.created_at),
        };
        set((state) => ({ meals: state.meals.map((m) => (m.id === id ? meal : m)) }));
      },

      deleteMeal: async (id) => {
        const userId = await getCurrentUserId();
        const { error } = await supabase.from('meals').delete().eq('id', id).eq('user_id', userId);
        if (error) throw error;
        set((state) => ({ meals: state.meals.filter((m) => m.id !== id) }));
      },

      loadWorkouts: async () => {
        set({ isSyncing: true, syncError: undefined });
        try {
          const userId = await getCurrentUserId();
          const { data: workoutsData, error } = await supabase
            .from('workouts')
            .select('id,user_id,title,workout_type,scheduled_for,duration_minutes,notes,created_at')
            .eq('user_id', userId)
            .gte('scheduled_for', daysAgoISO(29))
            .order('scheduled_for', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(60);
          if (error) throw error;
          const ids = (workoutsData ?? []).map((row) => row.id);
          const entriesByWorkout: Record<string, any> = {};
          if (ids.length) {
            const { data: entries, error: entriesError } = await supabase
              .from('workout_entries')
              .select('workout_id,exercise_name,sets,reps,weight')
              .eq('user_id', userId)
              .in('workout_id', ids);
            if (entriesError) throw entriesError;
            for (const entry of entries ?? []) entriesByWorkout[entry.workout_id] = entry;
          }
          set({
            workouts: (workoutsData ?? []).map((row) => {
              const entry = entriesByWorkout[row.id];
              return {
                id: row.id,
                userId: row.user_id,
                workoutType: (row.workout_type ?? 'gym') as WorkoutType,
                durationMinutes: row.duration_minutes ?? 0,
                exerciseName: entry?.exercise_name ?? undefined,
                sets: entry?.sets ?? undefined,
                reps: entry?.reps ?? undefined,
                weight: entry?.weight == null ? undefined : asNumber(entry.weight),
                notes: row.notes ?? undefined,
                date: row.scheduled_for ?? todayISO(),
                createdAt: toTimestamp(row.created_at),
              };
            }),
          });
        } catch (error) {
          if (!isMissingSupabaseTableError(error)) {
            set({ syncError: (error as Error).message });
          }
        } finally {
          set({ isSyncing: false });
        }
      },

      addWorkout: async (input) => {
        const userId = await getCurrentUserId();
        const title = input.workoutType === 'rest day' ? 'Rest day' : `${input.workoutType} workout`;
        const { data, error } = await supabase
          .from('workouts')
          .insert({
            user_id: userId,
            title,
            workout_type: input.workoutType,
            scheduled_for: input.date || todayISO(),
            duration_minutes: input.durationMinutes ?? 0,
            notes: input.notes?.trim() || null,
          })
          .select('id,user_id,workout_type,scheduled_for,duration_minutes,notes,created_at')
          .single();
        if (error) throw error;
        if (input.exerciseName?.trim()) {
          const { error: entryError } = await supabase.from('workout_entries').insert({
            user_id: userId,
            workout_id: data.id,
            exercise_name: input.exerciseName.trim(),
            sets: input.sets,
            reps: input.reps,
            weight: input.weight,
          });
          if (entryError) throw entryError;
        }
        const workout: WorkoutLog = {
          id: data.id,
          userId: data.user_id,
          workoutType: data.workout_type as WorkoutType,
          durationMinutes: data.duration_minutes ?? 0,
          exerciseName: input.exerciseName?.trim() || undefined,
          sets: input.sets,
          reps: input.reps,
          weight: input.weight,
          notes: data.notes ?? undefined,
          date: data.scheduled_for,
          createdAt: toTimestamp(data.created_at),
        };
        set((state) => ({ workouts: [workout, ...state.workouts] }));
      },

      updateWorkout: async (id, input) => {
        const userId = await getCurrentUserId();
        const { data, error } = await supabase
          .from('workouts')
          .update({
            title: input.workoutType ? (input.workoutType === 'rest day' ? 'Rest day' : `${input.workoutType} workout`) : undefined,
            workout_type: input.workoutType,
            scheduled_for: input.date,
            duration_minutes: input.durationMinutes,
            notes: input.notes?.trim() || null,
          })
          .eq('id', id)
          .eq('user_id', userId)
          .select('id,user_id,workout_type,scheduled_for,duration_minutes,notes,created_at')
          .single();
        if (error) throw error;
        await supabase.from('workout_entries').delete().eq('workout_id', id).eq('user_id', userId);
        if (input.exerciseName?.trim()) {
          const { error: entryError } = await supabase.from('workout_entries').insert({
            user_id: userId,
            workout_id: id,
            exercise_name: input.exerciseName.trim(),
            sets: input.sets,
            reps: input.reps,
            weight: input.weight,
          });
          if (entryError) throw entryError;
        }
        const workout: WorkoutLog = {
          id: data.id,
          userId: data.user_id,
          workoutType: data.workout_type as WorkoutType,
          durationMinutes: data.duration_minutes ?? 0,
          exerciseName: input.exerciseName?.trim() || undefined,
          sets: input.sets,
          reps: input.reps,
          weight: input.weight,
          notes: data.notes ?? undefined,
          date: data.scheduled_for,
          createdAt: toTimestamp(data.created_at),
        };
        set((state) => ({ workouts: state.workouts.map((w) => (w.id === id ? workout : w)) }));
      },

      deleteWorkout: async (id) => {
        const userId = await getCurrentUserId();
        const { error } = await supabase.from('workouts').delete().eq('id', id).eq('user_id', userId);
        if (error) throw error;
        set((state) => ({ workouts: state.workouts.filter((w) => w.id !== id) }));
      },

      loadDashboardSummary: async () => {
        try {
          const userId = await getCurrentUserId();
          const today = todayISO();
          const [
            habitsResult,
            habitLogsResult,
            goalsResult,
            dailyScoreResult,
          ] = await Promise.all([
            supabase.from('habits').select('id').eq('user_id', userId).eq('is_archived', false),
            supabase
              .from('habit_logs')
              .select('habit_id')
              .eq('user_id', userId)
              .eq('log_date', today)
              .eq('completed', true),
            supabase.from('goals').select('progress,target').eq('user_id', userId),
            supabase
              .from('daily_scores')
              .select('total_score')
              .eq('user_id', userId)
              .eq('score_date', today)
              .maybeSingle(),
          ]);

          for (const result of [habitsResult, habitLogsResult, goalsResult, dailyScoreResult]) {
            if (result.error && !isMissingSupabaseTableError(result.error)) throw result.error;
          }

          const goalRows = goalsResult.data ?? [];
          const goalProgress =
            goalRows.length === 0
              ? 0
              : goalRows.reduce(
                  (sum, goal) => sum + (goal.target > 0 ? asNumber(goal.progress) / asNumber(goal.target) : 0),
                  0
                ) / goalRows.length;

          set({
            dashboardSummary: {
              completedHabits: habitLogsResult.data?.length ?? 0,
              totalHabits: habitsResult.data?.length ?? 0,
              goalProgress,
              dailyScore:
                dailyScoreResult.data?.total_score == null
                  ? undefined
                  : asNumber(dailyScoreResult.data.total_score),
            },
          });
        } catch (error) {
          if (!isMissingSupabaseTableError(error)) {
            set({ syncError: (error as Error).message });
          }
        }
      },

      loadDailyActivity: async () => {
        try {
          const userId = await getCurrentUserId();
          const { data, error } = await supabase
            .from('daily_activity')
            .select(
              'id,user_id,date,source,steps,calories_burned,active_minutes,exercise_minutes,distance_meters,workouts_count,sleep_minutes,avg_heart_rate,synced_at,created_at'
            )
            .eq('user_id', userId)
            .gte('date', daysAgoISO(29))
            .order('date', { ascending: false });
          if (error) throw error;
          set({
            dailyActivity: (data ?? []).map((row) => ({
              id: row.id,
              userId: row.user_id,
              date: row.date,
              source: row.source,
              steps: asNumber(row.steps),
              caloriesBurned: asNumber(row.calories_burned),
              activeMinutes: asNumber(row.active_minutes),
              exerciseMinutes: asNumber(row.exercise_minutes),
              distanceMeters: asNumber(row.distance_meters),
              workoutsCount: asNumber(row.workouts_count),
              sleepMinutes: row.sleep_minutes == null ? undefined : asNumber(row.sleep_minutes),
              avgHeartRate: row.avg_heart_rate == null ? undefined : asNumber(row.avg_heart_rate),
              syncedAt: row.synced_at ?? undefined,
              createdAt: toTimestamp(row.created_at),
            })),
          });
        } catch (error) {
          if (!isMissingSupabaseTableError(error)) {
            set({ syncError: (error as Error).message });
          }
        }
      },

      saveDailyActivity: async (activity) => {
        const userId = await getCurrentUserId();
        const payload = {
          user_id: userId,
          date: activity.date,
          source: activity.source,
          steps: Math.max(0, Math.round(activity.steps || 0)),
          calories_burned: Math.max(0, Math.round(activity.caloriesBurned || 0)),
          active_minutes: Math.max(0, Math.round(activity.activeMinutes || 0)),
          exercise_minutes: Math.max(0, Math.round(activity.exerciseMinutes || 0)),
          distance_meters: Math.max(0, Math.round(activity.distanceMeters || 0)),
          workouts_count: Math.max(0, Math.round(activity.workoutsCount || 0)),
          sleep_minutes:
            activity.sleepMinutes == null ? null : Math.max(0, Math.round(activity.sleepMinutes)),
          avg_heart_rate:
            activity.avgHeartRate == null ? null : Math.max(0, Math.round(activity.avgHeartRate)),
          synced_at: activity.syncedAt ?? new Date().toISOString(),
        };
        const { data, error } = await supabase
          .from('daily_activity')
          .upsert(payload, { onConflict: 'user_id,date,source' })
          .select(
            'id,user_id,date,source,steps,calories_burned,active_minutes,exercise_minutes,distance_meters,workouts_count,sleep_minutes,avg_heart_rate,synced_at,created_at'
          )
          .single();
        if (error) throw error;
        const next: DailyActivitySummary = {
          id: data.id,
          userId: data.user_id,
          date: data.date,
          source: data.source,
          steps: asNumber(data.steps),
          caloriesBurned: asNumber(data.calories_burned),
          activeMinutes: asNumber(data.active_minutes),
          exerciseMinutes: asNumber(data.exercise_minutes),
          distanceMeters: asNumber(data.distance_meters),
          workoutsCount: asNumber(data.workouts_count),
          sleepMinutes: data.sleep_minutes == null ? undefined : asNumber(data.sleep_minutes),
          avgHeartRate: data.avg_heart_rate == null ? undefined : asNumber(data.avg_heart_rate),
          syncedAt: data.synced_at ?? undefined,
          createdAt: toTimestamp(data.created_at),
        };
        set((state) => ({
          dailyActivity: [
            next,
            ...state.dailyActivity.filter(
              (item) => !(item.date === next.date && item.source === next.source)
            ),
          ].sort((a, b) => b.date.localeCompare(a.date)),
        }));
      },

      syncDailyActivity: async (date = todayISO()) => {
        const activity = await healthSync.syncDailyActivity(date);
        if (activity) {
          await useAppStore.getState().saveDailyActivity(activity);
        }
      },

      loadCoreData: async () => {
        const state = useAppStore.getState();
        await Promise.all([
          state.loadProfile(),
          state.loadMeals(),
          state.loadWorkouts(),
          state.loadReflections(),
          state.loadDashboardSummary(),
          state.loadGoals(),
          state.loadDailyActivity(),
        ]);
      },
    }),
    {
      name: 'lifeops-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        preferences: state.preferences,
        habits: state.habits,
        tasks: state.tasks,
        goals: state.goals,
        moods: state.moods,
        meals: state.meals,
        workouts: state.workouts,
        dailyActivity: state.dailyActivity,
        dashboardSummary: state.dashboardSummary,
      }),
    }
  )
);

export const getTodayISO = todayISO;

export const clampPercentage = (value: number) =>
  Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));

export const getNutritionTargets = (preferences: Preferences) => {
  const manualCalories = Number(preferences.calorieTarget);
  const manualProtein = Number(preferences.proteinTarget);
  const weightLb = parseWeightLb(preferences.weight);
  const goal = preferences.goal?.toLowerCase() ?? '';
  const activity = preferences.activityLevel?.toLowerCase() ?? '';
  const baseCalories = goal.includes('lose')
    ? 1900
    : goal.includes('gain') || goal.includes('muscle')
      ? 2600
      : 2200;
  const activityAdjustment = activity.includes('high') || activity.includes('very')
    ? 300
    : activity.includes('low') || activity.includes('light')
      ? -150
      : 0;
  return {
    calories:
      Number.isFinite(manualCalories) && manualCalories > 0
        ? Math.round(manualCalories)
        : baseCalories + activityAdjustment,
    proteinG:
      Number.isFinite(manualProtein) && manualProtein > 0
        ? Math.round(manualProtein)
        : Math.round(weightLb * (goal.includes('gain') || goal.includes('muscle') ? 0.85 : 0.7)),
  };
};

export const getDefaultTargets = (input: {
  weight?: string;
  goal?: string;
  activityLevel?: string;
}) => {
  const preferences: Preferences = {
    ...defaultPreferences,
    weight: input.weight,
    goal: input.goal,
    activityLevel: input.activityLevel,
  };
  const nutrition = getNutritionTargets(preferences);
  const goal = input.goal?.toLowerCase() ?? '';
  const activity = input.activityLevel?.toLowerCase() ?? '';
  return {
    calorieTarget: String(nutrition.calories),
    proteinTarget: String(nutrition.proteinG),
    waterTarget: activity.includes('active') ? '100' : '80',
    workoutFrequencyGoal: goal.includes('gain') || goal.includes('muscle') ? '4' : '3',
    movementGoal: goal.includes('lose') ? '9000' : activity.includes('light') ? '6500' : '8000',
  };
};

export const calculateCaloriePercentage = (consumed: number, target: number) =>
  clampPercentage(target > 0 ? (consumed / target) * 100 : 0);

export const calculateProteinPercentage = (consumed: number, target: number) =>
  clampPercentage(target > 0 ? (consumed / target) * 100 : 0);

export const calculateHabitPercentage = (completed: number, total: number) =>
  clampPercentage(total > 0 ? (completed / total) * 100 : 0);

export const calculateDailyScore = ({
  caloriePercentage,
  proteinPercentage,
  habitPercentage,
  workoutLogged,
  reflectionLogged,
}: {
  caloriePercentage: number;
  proteinPercentage: number;
  habitPercentage: number;
  workoutLogged: boolean;
  reflectionLogged: boolean;
}) => {
  const parts = [
    Math.min(caloriePercentage, 100),
    Math.min(proteinPercentage, 100),
    habitPercentage,
    workoutLogged ? 100 : 0,
    reflectionLogged ? 100 : 0,
  ];
  return clampPercentage(parts.reduce((sum, part) => sum + part, 0) / parts.length);
};
