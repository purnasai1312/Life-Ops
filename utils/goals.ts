import { Ionicons } from '@expo/vector-icons';
import type { AccentColor, GoalCategory, GoalUnit, Preferences } from '@/store/types';

export type GoalTemplate = {
  key: string;
  title: string;
  description: string;
  category: GoalCategory;
  unit: GoalUnit;
  target: number;
  color: AccentColor;
};

export const GOAL_CATEGORY_META: Record<
  GoalCategory,
  { label: string; icon: keyof typeof Ionicons.glyphMap; units: GoalUnit[] }
> = {
  nutrition: {
    label: 'Nutrition',
    icon: 'restaurant-outline',
    units: ['grams protein', 'calories', 'meals logged'],
  },
  workout: {
    label: 'Workout',
    icon: 'barbell-outline',
    units: ['sessions/week', 'minutes', 'workouts completed'],
  },
  movement: {
    label: 'Movement',
    icon: 'walk-outline',
    units: ['steps/day', 'minutes walking'],
  },
  sleep: {
    label: 'Sleep',
    icon: 'moon-outline',
    units: ['hours/night'],
  },
  hydration: {
    label: 'Hydration',
    icon: 'water-outline',
    units: ['cups/day', 'liters/day', 'oz/day'],
  },
  mindfulness: {
    label: 'Mindfulness',
    icon: 'leaf-outline',
    units: ['check-ins/week', 'minutes'],
  },
  recovery: {
    label: 'Recovery',
    icon: 'pulse-outline',
    units: ['minutes', 'yes/no'],
  },
  cardio: {
    label: 'Cardio',
    icon: 'heart-outline',
    units: ['minutes', 'sessions/week'],
  },
  strength: {
    label: 'Strength',
    icon: 'barbell-outline',
    units: ['sessions/week', 'workouts completed'],
  },
  mobility: {
    label: 'Mobility',
    icon: 'body-outline',
    units: ['minutes', 'sessions/week'],
  },
  custom: {
    label: 'Custom',
    icon: 'ellipse-outline',
    units: ['count', 'times/week', 'yes/no'],
  },
};

export const HEALTH_GOAL_TEMPLATES: GoalTemplate[] = [
  {
    key: 'protein',
    title: 'Hit protein target',
    description: 'Reach your daily protein number from logged meals.',
    category: 'nutrition',
    unit: 'grams protein',
    target: 120,
    color: 'forest',
  },
  {
    key: 'calories',
    title: 'Stay within calorie target',
    description: 'Use meal logs to stay aligned with your calorie range.',
    category: 'nutrition',
    unit: 'calories',
    target: 2200,
    color: 'accent',
  },
  {
    key: 'workouts',
    title: 'Complete 3 workouts/week',
    description: 'Build a repeatable weekly training rhythm.',
    category: 'workout',
    unit: 'sessions/week',
    target: 3,
    color: 'plum',
  },
  {
    key: 'walking',
    title: 'Walk 8,000 steps/day',
    description: 'Keep daily movement visible and achievable.',
    category: 'movement',
    unit: 'steps/day',
    target: 8000,
    color: 'sky',
  },
  {
    key: 'water',
    title: 'Drink water target',
    description: 'Hit your daily hydration target.',
    category: 'hydration',
    unit: 'oz/day',
    target: 80,
    color: 'sky',
  },
  {
    key: 'sleep',
    title: 'Sleep 7+ hours',
    description: 'Protect recovery with a consistent sleep floor.',
    category: 'sleep',
    unit: 'hours/night',
    target: 7,
    color: 'plum',
  },
  {
    key: 'reflect',
    title: 'Reflect daily',
    description: 'Check in often enough to notice patterns.',
    category: 'mindfulness',
    unit: 'check-ins/week',
    target: 7,
    color: 'mustard',
  },
  {
    key: 'muscle',
    title: 'Build muscle',
    description: 'Prioritize protein, strength sessions, and sleep.',
    category: 'strength',
    unit: 'sessions/week',
    target: 4,
    color: 'forest',
  },
  {
    key: 'healthy',
    title: 'Feel healthier',
    description: 'Stack water, walking, sleep, and reflection.',
    category: 'recovery',
    unit: 'times/week',
    target: 5,
    color: 'accent',
  },
];

export function getSuggestedGoalTemplates(preferences: Pick<Preferences, 'goal' | 'proteinTarget' | 'calorieTarget' | 'waterTarget' | 'movementGoal' | 'workoutFrequencyGoal'>) {
  const goal = (preferences.goal ?? '').toLowerCase();
  const keys = goal.includes('lose')
    ? ['calories', 'protein', 'walking', 'workouts']
    : goal.includes('gain') || goal.includes('muscle')
      ? ['protein', 'muscle', 'sleep']
      : goal.includes('maintain')
        ? ['walking', 'calories', 'workouts']
        : ['water', 'sleep', 'walking', 'reflect'];

  return HEALTH_GOAL_TEMPLATES.filter((template) => keys.includes(template.key)).map((template) => ({
    ...template,
    target:
      template.key === 'protein'
        ? Number(preferences.proteinTarget) || template.target
        : template.key === 'calories'
          ? Number(preferences.calorieTarget) || template.target
          : template.key === 'water'
            ? Number(preferences.waterTarget) || template.target
            : template.key === 'walking'
              ? Number(preferences.movementGoal) || template.target
              : template.key === 'workouts' || template.key === 'muscle'
                ? Number(preferences.workoutFrequencyGoal) || template.target
                : template.target,
  }));
}
