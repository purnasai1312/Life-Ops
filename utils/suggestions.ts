import type { MealType, Preferences, WorkoutType } from '@/store/types';

export type MealSuggestion = {
  id: string;
  name: string;
  title: string;
  category: string;
  mealType: MealType;
  dietTags: string[];
  goalTags: string[];
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  protein: number;
  carbs: number;
  fat: number;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servingSize: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  substitutions?: string[];
  imageKey?: string;
  illustrationKey?: string;
  notes: string;
};

export type WorkoutStep = {
  id: string;
  name: string;
  instruction: string;
  type: 'reps' | 'duration' | 'hold' | 'rest';
  sets?: number;
  reps?: number;
  durationSeconds?: number;
  restSeconds?: number;
  imageKey?: string;
  illustrationKey?: string;
};

export type WorkoutSuggestion = {
  id: string;
  title: string;
  category:
    | 'weight loss'
    | 'muscle gain'
    | 'feel healthier'
    | 'home'
    | 'gym'
    | 'walking/cardio'
    | 'mobility/recovery';
  workoutType: WorkoutType;
  preferenceTags: string[];
  goalTags: string[];
  experienceTags: string[];
  durationMinutes: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedCaloriesMin: number;
  estimatedCaloriesMax: number;
  equipment: string[];
  targetMuscles: string[];
  benefits: string[];
  description: string;
  steps: WorkoutStep[];
  exercises: string[];
  prescription: string;
  estimatedCaloriesRange: [number, number];
  exerciseName?: string;
  sets?: number;
  reps?: number;
  notes: string;
};

type RawMealSuggestion = Omit<
  MealSuggestion,
  | 'id'
  | 'name'
  | 'title'
  | 'category'
  | 'protein'
  | 'carbs'
  | 'fat'
  | 'prepTimeMinutes'
  | 'cookTimeMinutes'
  | 'servingSize'
  | 'description'
  | 'ingredients'
  | 'instructions'
  | 'substitutions'
> & { title: string };

const rawMealSuggestions: RawMealSuggestion[] = [
  {
    title: 'Tofu veggie bowl',
    mealType: 'lunch',
    dietTags: ['vegan', 'vegetarian', 'no preference', 'high protein'],
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
    dietTags: ['vegan', 'vegetarian', 'no preference'],
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
    dietTags: ['vegetarian', 'no preference', 'high protein'],
    goalTags: ['lose weight', 'maintain', 'feel healthier'],
    calories: 310,
    proteinG: 32,
    carbsG: 34,
    fatG: 6,
    notes: 'Greek yogurt, berries, and chia.',
  },
  {
    title: 'Egg avocado toast',
    mealType: 'breakfast',
    dietTags: ['vegetarian', 'no preference'],
    goalTags: ['maintain', 'feel healthier'],
    calories: 420,
    proteinG: 22,
    carbsG: 38,
    fatG: 20,
    notes: 'Eggs, whole-grain toast, avocado, and greens.',
  },
  {
    title: 'Chicken rice power bowl',
    mealType: 'lunch',
    dietTags: ['no preference', 'high protein'],
    goalTags: ['gain muscle', 'maintain'],
    calories: 680,
    proteinG: 52,
    carbsG: 72,
    fatG: 18,
    notes: 'Chicken, rice, beans, avocado, and salsa.',
  },
  {
    title: 'Turkey hummus wrap',
    mealType: 'lunch',
    dietTags: ['no preference', 'high protein'],
    goalTags: ['lose weight', 'maintain'],
    calories: 460,
    proteinG: 36,
    carbsG: 44,
    fatG: 14,
    notes: 'Turkey, hummus, greens, and whole-grain wrap.',
  },
  {
    title: 'Salmon sweet potato plate',
    mealType: 'dinner',
    dietTags: ['pescatarian', 'no preference', 'high protein'],
    goalTags: ['maintain', 'feel healthier', 'gain muscle'],
    calories: 610,
    proteinG: 44,
    carbsG: 52,
    fatG: 24,
    notes: 'Salmon, sweet potato, asparagus, and olive oil.',
  },
  {
    title: 'Tuna quinoa salad',
    mealType: 'lunch',
    dietTags: ['pescatarian', 'no preference', 'high protein'],
    goalTags: ['lose weight', 'maintain'],
    calories: 480,
    proteinG: 42,
    carbsG: 46,
    fatG: 14,
    notes: 'Tuna, quinoa, cucumber, greens, and lemon vinaigrette.',
  },
  {
    title: 'Tempeh quinoa plate',
    mealType: 'dinner',
    dietTags: ['vegan', 'vegetarian', 'no preference', 'high protein'],
    goalTags: ['gain muscle', 'maintain', 'feel healthier'],
    calories: 620,
    proteinG: 38,
    carbsG: 68,
    fatG: 22,
    notes: 'Tempeh, quinoa, greens, and seeds.',
  },
  {
    title: 'Vegan protein smoothie',
    mealType: 'snack',
    dietTags: ['vegan', 'vegetarian', 'no preference', 'high protein'],
    goalTags: ['gain muscle', 'maintain'],
    calories: 420,
    proteinG: 34,
    carbsG: 48,
    fatG: 10,
    notes: 'Pea protein, banana, oats, and nut butter.',
  },
  {
    title: 'Cottage cheese fruit bowl',
    mealType: 'snack',
    dietTags: ['vegetarian', 'no preference', 'high protein'],
    goalTags: ['lose weight', 'maintain', 'gain muscle'],
    calories: 280,
    proteinG: 30,
    carbsG: 28,
    fatG: 6,
    notes: 'Cottage cheese, berries, cinnamon, and walnuts.',
  },
  {
    title: 'Black bean taco bowl',
    mealType: 'dinner',
    dietTags: ['vegan', 'vegetarian', 'no preference'],
    goalTags: ['feel healthier', 'maintain', 'lose weight'],
    calories: 520,
    proteinG: 26,
    carbsG: 78,
    fatG: 12,
    notes: 'Black beans, corn, rice, salsa, avocado, and romaine.',
  },
  {
    title: 'Chickpea cucumber pita',
    mealType: 'lunch',
    dietTags: ['vegan', 'vegetarian', 'no preference'],
    goalTags: ['feel healthier', 'maintain'],
    calories: 450,
    proteinG: 20,
    carbsG: 62,
    fatG: 14,
    notes: 'Chickpeas, cucumber, tomato, greens, and tahini in pita.',
  },
  {
    title: 'Lean beef potato plate',
    mealType: 'dinner',
    dietTags: ['no preference', 'high protein'],
    goalTags: ['gain muscle', 'maintain'],
    calories: 700,
    proteinG: 54,
    carbsG: 58,
    fatG: 26,
    notes: 'Lean beef, potatoes, vegetables, and simple seasoning.',
  },
  {
    title: 'Overnight oats with seeds',
    mealType: 'breakfast',
    dietTags: ['vegan', 'vegetarian', 'no preference'],
    goalTags: ['feel healthier', 'maintain'],
    calories: 390,
    proteinG: 18,
    carbsG: 58,
    fatG: 12,
    notes: 'Oats, soy milk, chia, flax, berries, and cinnamon.',
  },
];

const rawWorkoutSuggestions = [
  workout('Brisk walking intervals', 'weight loss', 'walking', ['walking', 'mixed', 'home', 'gym'], ['lose weight', 'feel healthier', 'maintain'], ['beginner', 'intermediate', 'advanced'], 35, 'beginner', ['Warm-up walk', 'Brisk intervals', 'Easy walk'], '3 min easy + 1 min brisk x 7', [160, 260], 'Walk intervals'),
  workout('Low-impact cardio circuit', 'weight loss', 'cardio', ['home', 'gym', 'mixed'], ['lose weight'], ['beginner', 'intermediate'], 30, 'beginner', ['Marching', 'Step jacks', 'Bodyweight squats', 'Shadow boxing'], '4 rounds, 45 sec each', [180, 300], 'Low impact circuit', 4, 12),
  workout('Incline walk plus core', 'weight loss', 'cardio', ['gym', 'walking', 'mixed'], ['lose weight', 'feel healthier'], ['beginner', 'intermediate'], 40, 'beginner', ['Incline walk', 'Dead bug', 'Side plank'], '30 min walk + 2 core rounds', [220, 360], 'Incline walk'),
  workout('Strength and sweat circuit', 'weight loss', 'home', ['home', 'mixed'], ['lose weight', 'maintain'], ['intermediate', 'advanced'], 32, 'intermediate', ['Squat', 'Push-up', 'Reverse lunge', 'Plank shoulder tap'], '4 rounds of 10-12 reps', [220, 380], 'Bodyweight circuit', 4, 12),
  workout('Full-body dumbbell strength', 'muscle gain', 'gym', ['gym', 'mixed'], ['gain muscle', 'maintain', 'lose weight'], ['beginner', 'intermediate'], 45, 'beginner', ['Goblet squat', 'Dumbbell row', 'Dumbbell press', 'Romanian deadlift'], '3 sets of 8-10 reps', [180, 320], 'Goblet squat, row, press', 3, 10),
  workout('Upper body hypertrophy', 'muscle gain', 'gym', ['gym', 'mixed'], ['gain muscle'], ['intermediate', 'advanced'], 55, 'intermediate', ['Bench press', 'Lat pulldown', 'Shoulder press', 'Cable row'], '4 sets of 8-12 reps', [240, 420], 'Upper body strength', 4, 10),
  workout('Lower body strength', 'muscle gain', 'gym', ['gym', 'mixed'], ['gain muscle'], ['intermediate', 'advanced'], 60, 'intermediate', ['Squat or leg press', 'Romanian deadlift', 'Split squat', 'Calf raise'], '4 sets of 6-10 reps', [260, 460], 'Lower body strength', 4, 8),
  workout('Home muscle builder', 'muscle gain', 'home', ['home', 'mixed'], ['gain muscle', 'maintain'], ['beginner', 'intermediate'], 38, 'beginner', ['Tempo push-up', 'Backpack row', 'Split squat', 'Glute bridge'], '3 sets of 8-12 slow reps', [150, 280], 'Home strength', 3, 10),
  workout('Pull and posterior chain', 'muscle gain', 'gym', ['gym', 'mixed'], ['gain muscle'], ['intermediate', 'advanced'], 50, 'intermediate', ['Deadlift variation', 'Row', 'Hamstring curl', 'Face pull'], '4 sets, controlled reps', [250, 430], 'Posterior chain', 4, 8),
  workout('Gentle health reset', 'feel healthier', 'home', ['home', 'walking', 'mixed'], ['feel healthier', 'maintain'], ['beginner', 'intermediate', 'advanced'], 25, 'beginner', ['Mobility flow', 'Easy squats', 'Wall push-ups', 'Breathing'], '2 easy rounds + 5 min breathing', [80, 160], 'Mobility flow', 2, 10),
  workout('Morning energy walk', 'feel healthier', 'walking', ['walking', 'home', 'mixed'], ['feel healthier', 'lose weight', 'maintain'], ['beginner', 'intermediate', 'advanced'], 25, 'beginner', ['Easy walk', 'Posture reset'], 'Steady comfortable pace', [100, 200], 'Easy walk'),
  workout('Light strength foundation', 'feel healthier', 'home', ['home', 'gym', 'mixed'], ['feel healthier', 'maintain'], ['beginner'], 30, 'beginner', ['Chair squat', 'Incline push-up', 'Hip hinge', 'Carry'], '3 sets of 8-10 reps', [120, 220], 'Foundation strength', 3, 10),
  workout('Home bodyweight circuit', 'home', 'home', ['home', 'mixed'], ['lose weight', 'feel healthier', 'maintain'], ['beginner', 'intermediate', 'advanced'], 28, 'beginner', ['Squat', 'Push-up', 'Lunge', 'Plank'], '3 rounds of 12 reps', [160, 300], 'Squat, push-up, lunge, plank', 3, 12),
  workout('Apartment quiet workout', 'home', 'home', ['home', 'mixed'], ['feel healthier', 'lose weight'], ['beginner', 'intermediate'], 24, 'beginner', ['Glute bridge', 'Dead bug', 'Wall sit', 'Slow mountain climber'], '3 quiet rounds', [110, 220], 'Quiet circuit', 3, 10),
  workout('Home mobility strength mix', 'home', 'home', ['home', 'mixed'], ['feel healthier', 'maintain'], ['beginner', 'intermediate'], 35, 'beginner', ['World greatest stretch', 'Squat', 'Row variation', 'Side plank'], 'Mobility + 3 strength rounds', [140, 260], 'Mobility strength', 3, 10),
  workout('Gym machine starter', 'gym', 'gym', ['gym', 'mixed'], ['gain muscle', 'maintain', 'feel healthier'], ['beginner'], 40, 'beginner', ['Leg press', 'Chest press', 'Seated row', 'Lat pulldown'], '3 sets of 10 reps', [170, 300], 'Machine circuit', 3, 10),
  workout('Gym full-body progression', 'gym', 'gym', ['gym', 'mixed'], ['gain muscle', 'maintain'], ['intermediate'], 55, 'intermediate', ['Squat', 'Bench', 'Row', 'Hip thrust'], '4 sets of 6-10 reps', [240, 420], 'Full-body progression', 4, 8),
  workout('Dumbbell-only gym session', 'gym', 'gym', ['gym', 'mixed'], ['gain muscle', 'lose weight'], ['beginner', 'intermediate'], 42, 'beginner', ['Goblet squat', 'Dumbbell bench', 'Dumbbell row', 'Farmer carry'], '3 sets of 10 reps', [190, 340], 'Dumbbell session', 3, 10),
  workout('Steady cardio walk', 'walking/cardio', 'walking', ['walking', 'mixed'], ['lose weight', 'feel healthier', 'maintain'], ['beginner', 'intermediate', 'advanced'], 45, 'beginner', ['Steady walk'], 'Comfortable pace, nasal breathing if possible', [180, 320], 'Steady walk'),
  workout('Run-walk starter', 'walking/cardio', 'cardio', ['running', 'walking', 'mixed'], ['lose weight', 'feel healthier'], ['beginner'], 30, 'beginner', ['Walk', 'Easy jog'], '2 min walk + 30 sec jog x 10', [180, 330], 'Run-walk intervals'),
  workout('Bike or elliptical zone 2', 'walking/cardio', 'cardio', ['gym', 'mixed'], ['lose weight', 'maintain', 'feel healthier'], ['beginner', 'intermediate', 'advanced'], 35, 'beginner', ['Bike or elliptical'], 'Steady conversational effort', [220, 400], 'Zone 2 cardio'),
  workout('Cardio finisher', 'walking/cardio', 'cardio', ['gym', 'home', 'mixed'], ['lose weight', 'maintain'], ['intermediate', 'advanced'], 18, 'intermediate', ['Bike sprint', 'Fast walk', 'Step-up'], '30 sec hard + 90 sec easy x 8', [160, 300], 'Cardio intervals'),
  workout('Mobility reset', 'mobility/recovery', 'home', ['yoga/mobility', 'home', 'mixed'], ['feel healthier', 'maintain'], ['beginner', 'intermediate', 'advanced'], 20, 'beginner', ['Cat-cow', 'Hip flexor stretch', 'T-spine rotation', 'Hamstring floss'], '2 slow rounds', [40, 90], 'Mobility reset', 2, 8),
  workout('Recovery walk and stretch', 'mobility/recovery', 'walking', ['walking', 'yoga/mobility', 'mixed'], ['feel healthier', 'maintain'], ['beginner', 'intermediate', 'advanced'], 30, 'beginner', ['Easy walk', 'Calf stretch', 'Hip stretch'], '20 min walk + 10 min stretch', [100, 190], 'Recovery walk'),
  workout('Yoga mobility flow', 'mobility/recovery', 'home', ['yoga/mobility', 'home', 'mixed'], ['feel healthier'], ['beginner', 'intermediate'], 28, 'beginner', ['Sun salutation', 'Low lunge', 'Pigeon prep', 'Breathing'], 'Gentle continuous flow', [70, 150], 'Yoga mobility'),
  workout('Rest day walk', 'mobility/recovery', 'rest day', ['walking', 'home', 'gym', 'mixed'], ['feel healthier', 'maintain', 'gain muscle', 'lose weight'], ['beginner', 'intermediate', 'advanced'], 15, 'beginner', ['Easy walk', 'Breathing'], 'Very easy effort', [40, 100], 'Rest day walk'),
  workout('Advanced strength density', 'muscle gain', 'gym', ['gym', 'mixed'], ['gain muscle'], ['advanced'], 65, 'advanced', ['Squat', 'Bench', 'Pull-up', 'Romanian deadlift'], 'Supersets, 4-5 sets', [340, 560], 'Strength density', 5, 6),
  workout('Advanced conditioning circuit', 'weight loss', 'cardio', ['gym', 'home', 'mixed'], ['lose weight'], ['advanced'], 36, 'advanced', ['Kettlebell swing', 'Burpee variation', 'Row', 'Carry'], '6 rounds, quality pace', [320, 520], 'Conditioning circuit', 6, 10),
];

function workout(
  title: WorkoutSuggestion['title'],
  category: WorkoutSuggestion['category'],
  workoutType: WorkoutType,
  preferenceTags: string[],
  goalTags: string[],
  experienceTags: string[],
  durationMinutes: number,
  difficulty: WorkoutSuggestion['difficulty'],
  exercises: string[],
  prescription: string,
  estimatedCaloriesRange: [number, number],
  exerciseName?: string,
  sets?: number,
  reps?: number
): Omit<
  WorkoutSuggestion,
  | 'id'
  | 'estimatedCaloriesMin'
  | 'estimatedCaloriesMax'
  | 'equipment'
  | 'targetMuscles'
  | 'benefits'
  | 'description'
  | 'steps'
> {
  return {
    title,
    category,
    workoutType,
    preferenceTags,
    goalTags,
    experienceTags,
    durationMinutes,
    difficulty,
    exercises,
    prescription,
    estimatedCaloriesRange,
    exerciseName,
    sets,
    reps,
    notes: `${prescription}. ${exercises.join(', ')}.`,
  };
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const sentence = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

const mealSuggestions: MealSuggestion[] = rawMealSuggestions.map((meal) => ({
  ...meal,
  id: `meal-${slugify(meal.title)}`,
  name: meal.title,
  category: meal.mealType,
  protein: meal.proteinG,
  carbs: meal.carbsG,
  fat: meal.fatG,
  prepTimeMinutes: meal.mealType === 'snack' || meal.mealType === 'breakfast' ? 8 : 12,
  cookTimeMinutes: meal.mealType === 'snack' ? 0 : meal.mealType === 'breakfast' ? 8 : 18,
  servingSize: '1 serving',
  description: meal.notes,
  ingredients: meal.notes
    .replace(/\.$/, '')
    .split(/,| and /)
    .map((item) => item.trim())
    .filter(Boolean),
  instructions: [
    'Gather and portion the ingredients.',
    meal.mealType === 'snack'
      ? 'Combine everything in a bowl or blender.'
      : 'Cook or warm the main ingredients until ready.',
    'Season simply, plate, and log the meal when you eat it.',
  ],
  substitutions: meal.dietTags.includes('vegan')
    ? ['Swap grains or beans based on what you have ready.', 'Use soy, pea, tofu, tempeh, beans, lentils, nuts, or seeds for protein.']
    : ['Adjust the carb portion to match your target.', 'Use a similar protein source that fits your diet preference.'],
  illustrationKey: `meal-${slugify(meal.mealType)}`,
}));

const inferEquipment = (workout: { workoutType: WorkoutType; preferenceTags: string[]; exercises: string[] }) => {
  const text = `${workout.workoutType} ${workout.preferenceTags.join(' ')} ${workout.exercises.join(' ')}`.toLowerCase();
  if (text.includes('gym') || text.includes('machine') || text.includes('cable') || text.includes('lat pulldown')) return ['Gym equipment'];
  if (text.includes('dumbbell')) return ['Dumbbells'];
  if (text.includes('kettlebell')) return ['Kettlebell'];
  if (text.includes('walk') || text.includes('running')) return ['Comfortable shoes'];
  return ['Bodyweight'];
};

const inferTargets = (category: WorkoutSuggestion['category'], workoutType: WorkoutType) => {
  if (category === 'muscle gain' || workoutType === 'gym') return ['Full body', 'Strength'];
  if (category === 'walking/cardio' || workoutType === 'walking' || workoutType === 'cardio') return ['Heart health', 'Legs'];
  if (category === 'mobility/recovery') return ['Mobility', 'Recovery'];
  return ['Full body', 'Core'];
};

const buildSteps = (
  workout: Omit<
    WorkoutSuggestion,
    | 'id'
    | 'estimatedCaloriesMin'
    | 'estimatedCaloriesMax'
    | 'equipment'
    | 'targetMuscles'
    | 'benefits'
    | 'description'
    | 'steps'
  >
): WorkoutStep[] => {
  const base = workout.exercises.length > 0 ? workout.exercises : [workout.title];
  const isDuration = workout.workoutType === 'walking' || workout.workoutType === 'cardio' || /walk|bike|elliptical|mobility|yoga|stretch|breathing/i.test(workout.prescription);
  if (isDuration) {
    const activeSeconds = Math.max(300, Math.round((workout.durationMinutes * 60) / Math.max(base.length, 1)));
    return [
      {
        id: `${slugify(workout.title)}-warmup`,
        name: 'Warm-up',
        instruction: 'Start easy and settle into steady breathing.',
        type: 'duration',
        durationSeconds: Math.min(300, activeSeconds),
        illustrationKey: 'warmup',
      },
      ...base.map((name, index) => ({
        id: `${slugify(workout.title)}-${index + 1}`,
        name,
        instruction: `${sentence(name.toLowerCase())}. Keep the effort controlled and repeatable.`,
        type: /stretch|breathing|plank|hold/i.test(name) ? 'hold' as const : 'duration' as const,
        durationSeconds: activeSeconds,
        restSeconds: index < base.length - 1 ? 30 : undefined,
        illustrationKey: slugify(name),
      })),
      {
        id: `${slugify(workout.title)}-cooldown`,
        name: 'Cooldown',
        instruction: 'Ease down and finish with relaxed breathing.',
        type: 'duration',
        durationSeconds: 180,
        illustrationKey: 'cooldown',
      },
    ];
  }

  return base.map((name, index) => ({
    id: `${slugify(workout.title)}-${index + 1}`,
    name,
    instruction: `${sentence(name.toLowerCase())}. Move with control and stop before form breaks.`,
    type: /plank|wall sit|carry/i.test(name) ? 'hold' : 'reps',
    sets: workout.sets ?? 3,
    reps: /plank|wall sit|carry/i.test(name) ? undefined : workout.reps ?? 10,
    durationSeconds: /plank|wall sit|carry/i.test(name) ? 45 : undefined,
    restSeconds: 45,
    illustrationKey: slugify(name),
  }));
};

const workoutSuggestions: WorkoutSuggestion[] = rawWorkoutSuggestions.map((workout) => ({
  ...workout,
  id: `workout-${slugify(workout.title)}`,
  estimatedCaloriesMin: workout.estimatedCaloriesRange[0],
  estimatedCaloriesMax: workout.estimatedCaloriesRange[1],
  equipment: inferEquipment(workout),
  targetMuscles: inferTargets(workout.category, workout.workoutType),
  benefits: workout.goalTags.slice(0, 3),
  description: `${workout.title} is a ${workout.difficulty} ${workout.category} session built around ${workout.prescription.toLowerCase()}.`,
  steps: buildSteps(workout),
}));

const includes = (source: string | undefined, target: string) =>
  (source ?? '').toLowerCase().includes(target);

const normalizedGoal = (goal?: string) => {
  const value = (goal || 'feel healthier').toLowerCase();
  if (value.includes('lose')) return 'lose weight';
  if (value.includes('gain') || value.includes('muscle')) return 'gain muscle';
  if (value.includes('maintain')) return 'maintain';
  return 'feel healthier';
};

export function getMealSuggestions(preferences: Preferences) {
  const diet = (preferences.dietPreference || 'no preference').toLowerCase();
  const goal = normalizedGoal(preferences.goal);
  const dietMatches = mealSuggestions.filter((meal) => {
      if (includes(diet, 'vegan')) return meal.dietTags.includes('vegan');
      if (includes(diet, 'vegetarian')) return meal.dietTags.includes('vegetarian');
      if (includes(diet, 'pescatarian')) {
        return meal.dietTags.includes('pescatarian') || meal.dietTags.includes('vegetarian') || meal.dietTags.includes('vegan');
      }
      return meal.dietTags.includes('no preference');
    });
  const goalMatches = dietMatches.filter((meal) => meal.goalTags.includes(goal));
  return (goalMatches.length > 0 ? goalMatches : dietMatches.filter((meal) => meal.goalTags.includes('feel healthier')))
    .slice(0, 6);
}

export function getWorkoutSuggestions(preferences: Preferences) {
  const goal = normalizedGoal(preferences.goal);
  const preferencesList = preferences.workoutPreferences?.length
    ? preferences.workoutPreferences
    : preferences.workoutPreference
      ? [preferences.workoutPreference]
      : ['mixed'];
  const preferencesText = preferencesList.join(' ').toLowerCase();
  const experience = (preferences.experienceLevel || 'beginner').toLowerCase();
  const baseMatches = workoutSuggestions
    .filter((workout) => workout.preferenceTags.some((tag) => preferencesText.includes(tag)))
    .filter((workout) => workout.experienceTags.some((tag) => experience.includes(tag) || tag.includes(experience)));
  const goalMatches = baseMatches.filter((workout) => workout.goalTags.includes(goal));
  return (goalMatches.length > 0 ? goalMatches : baseMatches.filter((workout) => workout.goalTags.includes('feel healthier')))
    .slice(0, 8);
}

export const getMealSuggestionById = (id: string) =>
  mealSuggestions.find((meal) => meal.id === id);

export const getWorkoutSuggestionById = (id: string) =>
  workoutSuggestions.find((workout) => workout.id === id);

export { mealSuggestions, workoutSuggestions };
