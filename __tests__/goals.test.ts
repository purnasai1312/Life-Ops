import { GOAL_CATEGORY_META, HEALTH_GOAL_TEMPLATES, getSuggestedGoalTemplates } from '@/utils/goals';
import { getCategoryIcon, getCategoryUnits, isEmojiIcon } from '@/utils/lifeops-logic';

describe('goal metadata', () => {
  it('maps health categories to appropriate target units', () => {
    expect(GOAL_CATEGORY_META.nutrition.units).toEqual(
      expect.arrayContaining(['grams protein', 'calories', 'meals logged'])
    );
    expect(GOAL_CATEGORY_META.workout.units).toEqual(
      expect.arrayContaining(['sessions/week', 'minutes', 'workouts completed'])
    );
    expect(GOAL_CATEGORY_META.movement.units).toContain('steps/day');
    expect(GOAL_CATEGORY_META.sleep.units).toContain('hours/night');
    expect(GOAL_CATEGORY_META.hydration.units).toEqual(
      expect.arrayContaining(['cups/day', 'liters/day', 'oz/day'])
    );
    expect(GOAL_CATEGORY_META.mindfulness.units).toContain('check-ins/week');
  });

  it('uses profile targets in suggested onboarding goals', () => {
    const templates = getSuggestedGoalTemplates({
      goal: 'Lose weight',
      proteinTarget: '150',
      calorieTarget: '1900',
      waterTarget: '90',
      movementGoal: '9000',
      workoutFrequencyGoal: '3',
    });

    expect(templates.map((template) => template.key)).toEqual(
      expect.arrayContaining(['calories', 'protein', 'walking', 'workouts'])
    );
    expect(templates.find((template) => template.key === 'protein')?.target).toBe(150);
    expect(templates.find((template) => template.key === 'calories')?.target).toBe(1900);
    expect(templates.find((template) => template.key === 'walking')?.target).toBe(9000);
  });

  it('maps every goal category to valid units', () => {
    expect(getCategoryUnits('nutrition')).toEqual(expect.arrayContaining(['grams protein', 'calories', 'meals logged']));
    expect(getCategoryUnits('workout')).toEqual(expect.arrayContaining(['sessions/week', 'minutes']));
    expect(getCategoryUnits('movement')).toEqual(expect.arrayContaining(['steps/day', 'minutes walking']));
    expect(getCategoryUnits('sleep')).toContain('hours/night');
    expect(getCategoryUnits('hydration')).toEqual(expect.arrayContaining(['cups/day', 'liters/day', 'oz/day']));
    expect(getCategoryUnits('mindfulness')).toEqual(expect.arrayContaining(['check-ins/week', 'minutes']));
    expect(getCategoryUnits('custom')).toEqual(expect.arrayContaining(['count', 'times/week', 'yes/no']));
  });

  it('does not include irrelevant default goals', () => {
    const titles = HEALTH_GOAL_TEMPLATES.map((goal) => goal.title.toLowerCase()).join(' ');
    expect(titles).not.toMatch(/read 24 books|half marathon|inbox|book/);
  });

  it('uses minimal outline icon names, not emoji icons', () => {
    for (const category of Object.keys(GOAL_CATEGORY_META) as Array<keyof typeof GOAL_CATEGORY_META>) {
      const icon = getCategoryIcon(category);
      expect(icon).toMatch(/-outline$/);
      expect(isEmojiIcon(icon)).toBe(false);
    }
  });
});
