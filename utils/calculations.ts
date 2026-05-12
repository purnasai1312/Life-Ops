export const clampPercentage = (value: number) =>
  Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));

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
    clampPercentage(caloriePercentage),
    clampPercentage(proteinPercentage),
    clampPercentage(habitPercentage),
    workoutLogged ? 100 : 0,
    reflectionLogged ? 100 : 0,
  ];
  return clampPercentage(parts.reduce((sum, part) => sum + part, 0) / parts.length);
};

const toISODate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const computeStreak = (
  completions: Record<string, boolean>,
  asOf: Date = new Date()
) => {
  let streak = 0;
  const date = new Date(asOf);
  const today = toISODate(date);
  if (!completions[today]) {
    date.setDate(date.getDate() - 1);
  }

  while (true) {
    const key = toISODate(date);
    if (!completions[key]) break;
    streak += 1;
    date.setDate(date.getDate() - 1);
  }

  return streak;
};

export const calculateDashboardZeroState = () =>
  calculateDailyScore({
    caloriePercentage: 0,
    proteinPercentage: 0,
    habitPercentage: 0,
    workoutLogged: false,
    reflectionLogged: false,
  });
