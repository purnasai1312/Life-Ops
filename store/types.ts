/**
 * Core entity types for the LifeOps app store.
 */

export type HabitCadence = 'daily' | 'weekdays' | 'weekly';

export type AccentColor =
  | 'accent'
  | 'forest'
  | 'mustard'
  | 'plum'
  | 'sky';

export interface Habit {
  id: string;
  title: string;
  icon: string; // Ionicons name
  color: AccentColor;
  cadence: HabitCadence;
  createdAt: number;
  /** Map of ISO date (YYYY-MM-DD) -> completed */
  completions: Record<string, boolean>;
  streak: number;
}

export interface Task {
  id: string;
  title: string;
  note?: string;
  done: boolean;
  /** ISO date (YYYY-MM-DD) the task belongs to */
  date: string;
  createdAt: number;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  color: AccentColor;
  target: number;
  progress: number;
  dueDate?: string; // ISO date
  createdAt: number;
}

export type MoodValue = 1 | 2 | 3 | 4 | 5;

export interface MoodEntry {
  id: string;
  date: string; // ISO date
  value: MoodValue;
  note?: string;
  createdAt: number;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MealEntry {
  id: string;
  userId: string;
  mealType: MealType;
  foodName: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  notes?: string;
  date: string;
  createdAt: number;
}

export type WorkoutType = 'gym' | 'home' | 'cardio' | 'walking' | 'rest day';

export interface WorkoutLog {
  id: string;
  userId: string;
  workoutType: WorkoutType;
  durationMinutes: number;
  exerciseName?: string;
  sets?: number;
  reps?: number;
  weight?: number;
  notes?: string;
  date: string;
  createdAt: number;
}

export interface Preferences {
  userId?: string;
  name: string;
  focusStatement: string;
  hasCompletedOnboarding: boolean;
  notificationsEnabled: boolean;
  weekStartsOnMonday: boolean;
  age?: string;
  height?: string;
  weight?: string;
  goal?: string;
  activityLevel?: string;
  dietPreference?: string;
  workoutPreference?: string;
  experienceLevel?: string;
  calorieTarget?: string;
  proteinTarget?: string;
  waterTarget?: string;
  workoutFrequencyGoal?: string;
  movementGoal?: string;
  habitPriorities?: string[];
  habits?: string[];
  intentions?: string[];
}

export interface OnboardingProfile {
  userId?: string;
  name: string;
  focusStatement: string;
  age: string;
  height: string;
  weight: string;
  goal: string;
  activityLevel: string;
  dietPreference: string;
  workoutPreference: string;
  experienceLevel: string;
  calorieTarget: string;
  proteinTarget: string;
  waterTarget: string;
  workoutFrequencyGoal: string;
  movementGoal: string;
  habitPriorities: string[];
  habits: string[];
  intentions: string[];
}
