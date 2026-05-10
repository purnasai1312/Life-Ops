import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isMissingSupabaseTableError, supabase } from '@/lib/supabase';
import type {
  Habit,
  Task,
  Goal,
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

const todayISO = () => {
  const d = new Date();
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

const getCurrentUserId = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw error ?? new Error('No authenticated user.');
  return data.user.id;
};

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
    target: number;
    dueDate?: string;
  }) => void;
  incrementGoal: (goalId: string, delta: number) => void;
  deleteGoal: (goalId: string) => void;

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
              'id,name,age,height,weight,goal,activity_level,diet_preference,workout_preference,habits,intentions,focus_statement,has_completed_onboarding,notifications_enabled,week_starts_on_monday'
            )
            .eq('id', userId)
            .maybeSingle();
          if (error) throw error;
          if (!data) return;
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
              habits: data.habits ?? undefined,
              intentions: data.intentions ?? undefined,
              focusStatement: data.focus_statement ?? '',
              hasCompletedOnboarding: !!data.has_completed_onboarding,
              notificationsEnabled: data.notifications_enabled ?? true,
              weekStartsOnMonday: data.week_starts_on_monday ?? true,
            },
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
            focus_statement: next.focusStatement?.trim() || null,
            has_completed_onboarding: next.hasCompletedOnboarding,
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
              focus_statement: profile.focus_statement,
              habits: next.habits ?? [],
              intentions: next.intentions ?? [],
              completed_at: next.hasCompletedOnboarding ? new Date().toISOString() : null,
            },
            { onConflict: 'user_id' }
          );
          if (onboardingError && !isMissingSupabaseTableError(onboardingError)) {
            throw onboardingError;
          }
          set((state) => ({ preferences: { ...state.preferences, ...partial, userId } }));
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
          dashboardSummary: {
            completedHabits: 0,
            totalHabits: 0,
            goalProgress: 0,
          },
          syncError: undefined,
        })),

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

      addGoal: ({ title, description, color, target, dueDate }) =>
        set((state) => ({
          goals: [
            ...state.goals,
            {
              id: uid(),
              title: title.trim(),
              description: description?.trim() || undefined,
              color,
              target,
              progress: 0,
              dueDate,
              createdAt: Date.now(),
            },
          ],
        })),

      incrementGoal: (goalId, delta) =>
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === goalId
              ? {
                  ...g,
                  progress: Math.max(0, Math.min(g.target, g.progress + delta)),
                }
              : g
          ),
        })),

      deleteGoal: (goalId) =>
        set((state) => ({
          goals: state.goals.filter((g) => g.id !== goalId),
        })),

      loadReflections: async () => {
        set({ isSyncing: true, syncError: undefined });
        try {
          const userId = await getCurrentUserId();
          const { data, error } = await supabase
            .from('reflections')
            .select('id,reflection_date,mood_value,note,created_at')
            .eq('user_id', userId)
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

      loadCoreData: async () => {
        const state = useAppStore.getState();
        await Promise.all([
          state.loadProfile(),
          state.loadMeals(),
          state.loadWorkouts(),
          state.loadReflections(),
          state.loadDashboardSummary(),
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
        dashboardSummary: state.dashboardSummary,
      }),
    }
  )
);

export const getTodayISO = todayISO;

export const clampPercentage = (value: number) =>
  Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));

export const getNutritionTargets = (preferences: Preferences) => {
  const weight = Number(preferences.weight);
  const weightLb = Number.isFinite(weight) && weight > 0 ? weight : 160;
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
    calories: baseCalories + activityAdjustment,
    proteinG: Math.round(weightLb * 0.7),
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
