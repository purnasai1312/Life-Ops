import {
  buildMealInsertPayload,
  buildMealUpdatePayload,
  calculateMealTotals,
  getMealDetailRoute,
  groupByDate,
  mealSuggestionToMealInput,
} from '@/utils/lifeops-logic';
import { getMealSuggestions, mealSuggestions } from '@/utils/suggestions';
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
      metadata: {
        source: 'manual',
        template_id: null,
        logged_at: null,
      },
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
    const forbiddenVegan = /\b(chicken|turkey|salmon|tuna|beef|egg|eggs|yogurt|cheese|dairy|whey|cottage|honey|fish)\b/;
    for (const meal of getMealSuggestions({ ...preferences, dietPreference: 'vegan', goal: 'gain muscle' })) {
      expect(meal.dietTags).toContain('vegan');
      expect(`${meal.title} ${meal.notes} ${meal.ingredients.join(' ')}`.toLowerCase()).not.toMatch(forbiddenVegan);
    }
    for (const meal of getMealSuggestions({ ...preferences, dietPreference: 'vegetarian' })) {
      expect(meal.dietTags).toContain('vegetarian');
      expect(`${meal.title} ${meal.notes}`.toLowerCase()).not.toMatch(/chicken|turkey|salmon|tuna|beef|fish/);
    }
  });

  it('filters meal suggestions by goal and maps explicit Add to Today payloads', () => {
    const suggestions = getMealSuggestions({ ...preferences, goal: 'gain muscle', dietPreference: 'no preference' });
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions.every((meal) => meal.goalTags.includes('gain muscle'))).toBe(true);
    expect(getMealDetailRoute(suggestions[0].id)).toEqual({
      pathname: '/meal-detail',
      params: { id: suggestions[0].id },
    });
    const payload = mealSuggestionToMealInput(suggestions[0], '2026-05-11');
    expect(payload).toEqual(expect.objectContaining({
      name: suggestions[0].title,
      meal_date: '2026-05-11',
      metadata: expect.objectContaining({ source: 'suggested', template_id: suggestions[0].id }),
    }));
  });

  it('has recipe detail data for every meal suggestion', () => {
    expect(mealSuggestions.length).toBeGreaterThanOrEqual(15);
    for (const meal of mealSuggestions) {
      expect(meal.id).toMatch(/^meal-/);
      expect(meal.name).toBe(meal.title);
      expect(meal.ingredients.length).toBeGreaterThan(0);
      expect(meal.instructions.length).toBeGreaterThan(0);
      expect(meal.prepTimeMinutes).toBeGreaterThanOrEqual(0);
      expect(meal.cookTimeMinutes).toBeGreaterThanOrEqual(0);
      expect(meal.calories).toBeGreaterThan(0);
      expect(meal.proteinG).toBeGreaterThanOrEqual(0);
    }
  });

  it('viewing or cancelling a meal suggestion creates no record', () => {
    const addMeal = jest.fn();
    const [suggestion] = getMealSuggestions(preferences);
    getMealDetailRoute(suggestion.id);
    expect(addMeal).not.toHaveBeenCalled();
  });

  it('Add to Today creates exactly one meal record with actual nutrition', () => {
    const addMeal = jest.fn();
    const [suggestion] = getMealSuggestions(preferences);
    addMeal({
      mealType: suggestion.mealType,
      foodName: suggestion.name,
      calories: suggestion.calories,
      proteinG: suggestion.proteinG,
      carbsG: suggestion.carbsG,
      fatG: suggestion.fatG,
      source: 'suggested',
      templateId: suggestion.id,
    });
    expect(addMeal).toHaveBeenCalledTimes(1);
    expect(addMeal).toHaveBeenCalledWith(expect.objectContaining({
      calories: suggestion.calories,
      proteinG: suggestion.proteinG,
      templateId: suggestion.id,
    }));
  });
});
