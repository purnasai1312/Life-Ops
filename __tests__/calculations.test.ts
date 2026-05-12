import {
  calculateCaloriePercentage,
  calculateDashboardZeroState,
  calculateDailyScore,
  calculateHabitPercentage,
  calculateProteinPercentage,
  clampPercentage,
  computeStreak,
} from '@/utils/calculations';

describe('calculation helpers', () => {
  it('clamps percentages between 0 and 100', () => {
    expect(clampPercentage(-10)).toBe(0);
    expect(clampPercentage(47)).toBe(47);
    expect(clampPercentage(140)).toBe(100);
    expect(clampPercentage(Number.NaN)).toBe(0);
  });

  it('calculates calorie and protein percentages with clamping', () => {
    expect(calculateCaloriePercentage(500, 2000)).toBe(25);
    expect(calculateCaloriePercentage(2500, 2000)).toBe(100);
    expect(calculateCaloriePercentage(500, 0)).toBe(0);
    expect(calculateProteinPercentage(75, 150)).toBe(50);
    expect(calculateProteinPercentage(180, 120)).toBe(100);
  });

  it('calculates habit completion percentage', () => {
    expect(calculateHabitPercentage(0, 0)).toBe(0);
    expect(calculateHabitPercentage(1, 4)).toBe(25);
    expect(calculateHabitPercentage(5, 4)).toBe(100);
  });

  it('calculates streak using today or yesterday as the anchor', () => {
    const asOf = new Date('2026-05-11T12:00:00');
    expect(
      computeStreak(
        {
          '2026-05-11': true,
          '2026-05-10': true,
          '2026-05-09': true,
          '2026-05-07': true,
        },
        asOf
      )
    ).toBe(3);

    expect(
      computeStreak(
        {
          '2026-05-10': true,
          '2026-05-09': true,
        },
        asOf
      )
    ).toBe(2);
  });

  it('keeps a brand-new dashboard at zero', () => {
    expect(calculateDashboardZeroState()).toBe(0);
    expect(
      calculateDailyScore({
        caloriePercentage: 0,
        proteinPercentage: 0,
        habitPercentage: 0,
        workoutLogged: false,
        reflectionLogged: false,
      })
    ).toBe(0);
  });
});
