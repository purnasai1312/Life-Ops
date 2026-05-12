import {
  buildMealInsertPayload,
  buildMealUpdatePayload,
  calculateMealTotals,
  groupByDate,
  mealSuggestionToMealInput,
} from '@/utils/lifeops-logic';
import { getMealSuggestions } from '@/utils/suggestions';
import type { MealEntry, Preferences } from '@/store/types';

const preferences: Preferences = {
  name: 'Test',
  focusStatement: '',
  hasCompletedOnboarding: true,
  notificationsEnabled: true,
  weekStartsOnMonday: true,
  dietPreference: 'no preference',
  goal: 'maintain',
};

const meals: MealEntry[] = [
  { id: '1', userId: 'u1', mealType: 'breakfast', foodName: 'Oats', calories: 400, proteinG: 20, carbsG: 60, fatG: 10, date: '2026-05-11', createdAt: 1 },
  { id: '2', userId: 'u1', mealType: 'lunch', foodName: 'Bowl', calories: 600, proteinG: 45, carbsG: 70, fatG: 15, date: '2026-05-11', createdAt: 2 },
  { id: '3', userId: 'u1', mealType: 'dinner', foodName: 'Soup', calories: 350, proteinG: 22, carbsG: 50, fatG: 8, date: '2026-05-05', createdAt: 3 },
];

describe('meal logic', () => {
  it('maps add and edit meal payloads to Supabase columns with user_id', () => {
    expect(
      buildMealInsertPayload('u1', {
        mealType: 'lunch',
        foodName: ' Protein bowl ',
        calories: 520,
        proteinG: 40,
        carbsG: 55,
        fatG: 14,
        notes: ' balanced ',
        date: '2026-05-11',
      })
    ).toEqual({
      user_id: 'u1',
      name: 'Protein bowl',
      description: 'balanced',
      meal_type: 'lunch',
      meal_date: '2026-05-11',
      calories: 520,
      protein_g: 40,
      carbs_g: 55,
      fat_g: 14,
    });

    expect(buildMealUpdatePayload({ foodName: 'Dinner', mealType: 'dinner', proteinG: 35 })).toEqual(
      expect.objectContaining({ name: 'Dinner', meal_type: 'dinner', protein_g: 35 })
    );
  });

  it('calculates daily totals and groups 7-day/30-day histories by date', () => {
    expect(calculateMealTotals(meals.filter((meal) => meal.date === '2026-05-11'))).toEqual({
      calories: 1000,
      proteinG: 65,
      carbsG: 130,
      fatG: 25,
    });
    expect(Object.keys(groupByDate(meals))).toEqual(['2026-05-11', '2026-05-05']);
  });

  it('enforces vegan and vegetarian suggestion filters', () => {
    const forbiddenVegan = /\b(chicken|turkey|salmon|tuna|beef|egg|eggs|yogurt|cheese|dairy|whey|cottage)\b/;
    for (const meal of getMealSuggestions({ ...preferences, dietPreference: 'vegan', goal: 'gain muscle' })) {
      expect(meal.dietTags).toContain('vegan');
      expect(`${meal.title} ${meal.notes}`.toLowerCase()).not.toMatch(forbiddenVegan);
    }
    for (const meal of getMealSuggestions({ ...preferences, dietPreference: 'vegetarian' })) {
      expect(meal.dietTags).toContain('vegetarian');
      expect(`${meal.title} ${meal.notes}`.toLowerCase()).not.toMatch(/chicken|turkey|salmon|tuna|beef|fish/);
    }
  });

  it('filters meal suggestions by goal and maps quick-add payloads', () => {
    const suggestions = getMealSuggestions({ ...preferences, goal: 'gain muscle', dietPreference: 'no preference' });
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions.every((meal) => meal.goalTags.includes('gain muscle'))).toBe(true);
    const payload = mealSuggestionToMealInput(suggestions[0], '2026-05-11');
    expect(payload).toEqual(expect.objectContaining({ name: suggestions[0].title, meal_date: '2026-05-11' }));
  });
});
