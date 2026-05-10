import type { MealType, Preferences, WorkoutType } from '@/store/types';

export type MealSuggestion = {
  title: string;
  mealType: MealType;
  dietTags: string[];
  goalTags: string[];
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  notes: string;
};

export type WorkoutSuggestion = {
  title: string;
  workoutType: WorkoutType;
  preferenceTags: string[];
  goalTags: string[];
  experienceTags: string[];
  durationMinutes: number;
  exerciseName?: string;
  sets?: number;
  reps?: number;
  notes: string;
};

const mealSuggestions: MealSuggestion[] = [
  {
    title: 'Tofu veggie bowl',
    mealType: 'lunch',
    dietTags: ['vegan', 'vegetarian', 'flexible', 'mediterranean', 'high protein'],
    goalTags: ['lose weight', 'maintain', 'feel healthier'],
    calories: 430,
    proteinG: 28,
    carbsG: 48,
    fatG: 14,
    notes: 'Tofu, greens, rice, and tahini-lemon sauce.',
  },
  {
    title: 'Lentil protein soup',
    mealType: 'dinner',
    dietTags: ['vegan', 'vegetarian', 'flexible', 'mediterranean'],
    goalTags: ['lose weight', 'maintain', 'feel healthier'],
    calories: 380,
    proteinG: 24,
    carbsG: 56,
    fatG: 8,
    notes: 'Lentils, vegetables, herbs, and olive oil.',
  },
  {
    title: 'Greek yogurt berries',
    mealType: 'breakfast',
    dietTags: ['vegetarian', 'flexible', 'mediterranean', 'high protein'],
    goalTags: ['lose weight', 'maintain', 'feel healthier'],
    calories: 310,
    proteinG: 32,
    carbsG: 34,
    fatG: 6,
    notes: 'Greek yogurt, berries, and chia.',
  },
  {
    title: 'Chicken rice power bowl',
    mealType: 'lunch',
    dietTags: ['flexible', 'high protein'],
    goalTags: ['gain muscle', 'maintain'],
    calories: 680,
    proteinG: 52,
    carbsG: 72,
    fatG: 18,
    notes: 'Chicken, rice, beans, avocado, and salsa.',
  },
  {
    title: 'Tempeh quinoa plate',
    mealType: 'dinner',
    dietTags: ['vegan', 'vegetarian', 'high protein'],
    goalTags: ['gain muscle', 'maintain', 'feel healthier'],
    calories: 620,
    proteinG: 38,
    carbsG: 68,
    fatG: 22,
    notes: 'Tempeh, quinoa, greens, and seeds.',
  },
  {
    title: 'Protein smoothie',
    mealType: 'snack',
    dietTags: ['vegan', 'vegetarian', 'flexible', 'high protein'],
    goalTags: ['gain muscle', 'maintain'],
    calories: 420,
    proteinG: 34,
    carbsG: 48,
    fatG: 10,
    notes: 'Protein, banana, oats, and nut butter.',
  },
];

const workoutSuggestions: WorkoutSuggestion[] = [
  {
    title: 'Brisk walking intervals',
    workoutType: 'walking',
    preferenceTags: ['walking', 'mixed', 'home', 'gym'],
    goalTags: ['lose weight', 'feel healthier', 'maintain'],
    experienceTags: ['beginner', 'intermediate', 'advanced'],
    durationMinutes: 35,
    exerciseName: 'Walk intervals',
    notes: 'Alternate 3 minutes easy with 1 minute brisk.',
  },
  {
    title: 'Full-body dumbbell strength',
    workoutType: 'gym',
    preferenceTags: ['gym', 'mixed'],
    goalTags: ['gain muscle', 'maintain', 'lose weight'],
    experienceTags: ['beginner', 'intermediate'],
    durationMinutes: 45,
    exerciseName: 'Goblet squat, row, press',
    sets: 3,
    reps: 10,
    notes: 'Controlled reps with two minutes rest.',
  },
  {
    title: 'Home bodyweight circuit',
    workoutType: 'home',
    preferenceTags: ['home', 'mixed'],
    goalTags: ['lose weight', 'feel healthier', 'maintain'],
    experienceTags: ['beginner', 'intermediate', 'advanced'],
    durationMinutes: 28,
    exerciseName: 'Squat, push-up, lunge, plank',
    sets: 3,
    reps: 12,
    notes: 'Move steadily. Stop two reps before form breaks.',
  },
  {
    title: 'Upper/lower gym session',
    workoutType: 'gym',
    preferenceTags: ['gym', 'mixed'],
    goalTags: ['gain muscle'],
    experienceTags: ['intermediate', 'advanced'],
    durationMinutes: 60,
    exerciseName: 'Leg press, bench, pulldown',
    sets: 4,
    reps: 8,
    notes: 'Strength focus with progressive overload.',
  },
  {
    title: 'Mobility and light strength',
    workoutType: 'home',
    preferenceTags: ['home', 'walking', 'mixed'],
    goalTags: ['feel healthier', 'maintain'],
    experienceTags: ['beginner', 'intermediate', 'advanced'],
    durationMinutes: 25,
    exerciseName: 'Mobility flow',
    sets: 2,
    reps: 10,
    notes: 'Hips, back, shoulders, and easy core.',
  },
];

const includes = (source: string | undefined, target: string) =>
  (source ?? '').toLowerCase().includes(target);

export function getMealSuggestions(preferences: Preferences) {
  const diet = (preferences.dietPreference || 'flexible').toLowerCase();
  const goal = (preferences.goal || 'feel healthier').toLowerCase();
  return mealSuggestions
    .filter((meal) => {
      if (includes(diet, 'vegan')) return meal.dietTags.includes('vegan');
      if (includes(diet, 'vegetarian')) return meal.dietTags.includes('vegetarian');
      if (includes(diet, 'high')) return meal.dietTags.includes('high protein');
      if (includes(diet, 'mediterranean')) return meal.dietTags.includes('mediterranean');
      return meal.dietTags.includes('flexible');
    })
    .filter((meal) => meal.goalTags.some((tag) => goal.includes(tag) || tag.includes(goal)))
    .slice(0, 3);
}

export function getWorkoutSuggestions(preferences: Preferences) {
  const goal = (preferences.goal || 'feel healthier').toLowerCase();
  const preference = (preferences.workoutPreference || 'mixed').toLowerCase();
  const experience = (preferences.experienceLevel || 'beginner').toLowerCase();
  return workoutSuggestions
    .filter((workout) => workout.preferenceTags.some((tag) => preference.includes(tag) || tag.includes(preference)))
    .filter((workout) => workout.goalTags.some((tag) => goal.includes(tag) || tag.includes(goal)))
    .filter((workout) => workout.experienceTags.some((tag) => experience.includes(tag) || tag.includes(experience)))
    .slice(0, 3);
}
