import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useCallback, useEffect, useMemo } from 'react';
import { Screen } from '@/components/screen';
import { Typo } from '@/components/typography';
import { Card } from '@/components/card';
import { Tag } from '@/components/tag';
import { Checkbox } from '@/components/checkbox';
import { Button } from '@/components/button';
import { ProgressRing } from '@/components/progress-ring';
import { ProgressBar } from '@/components/progress-bar';
import { IconBadge } from '@/components/icon-badge';
import { Colors, DisplayFont, Radii } from '@/constants/Theme';
import { Fonts } from '@/constants/Typography';
import {
  calculateCaloriePercentage,
  calculateDailyScore,
  calculateHabitPercentage,
  calculateProteinPercentage,
  getNutritionTargets,
  useAppStore,
  getTodayISO,
} from '@/store/useAppStore';
import { accentPair } from '@/utils/colors';
import {
  formatLongDate,
  greeting,
  lastNDates,
  dayLetter,
} from '@/utils/date';

export default function TodayScreen() {
  const router = useRouter();
  const preferences = useAppStore((s) => s.preferences);
  const tasks = useAppStore((s) => s.tasks);
  const habits = useAppStore((s) => s.habits);
  const moods = useAppStore((s) => s.moods);
  const meals = useAppStore((s) => s.meals);
  const workouts = useAppStore((s) => s.workouts);
  const dailyActivity = useAppStore((s) => s.dailyActivity);
  const dashboardSummary = useAppStore((s) => s.dashboardSummary);
  const loadCoreData = useAppStore((s) => s.loadCoreData);
  const toggleTask = useAppStore((s) => s.toggleTask);
  const toggleHabitToday = useAppStore((s) => s.toggleHabitToday);

  const today = getTodayISO();
  useEffect(() => {
    loadCoreData().catch(() => {});
  }, [loadCoreData]);

  const todayTasks = useMemo(() => tasks.filter((t) => t.date === today), [tasks, today]);

  const habitsDoneToday = dashboardSummary.completedHabits;
  const totalHabits = dashboardSummary.totalHabits;
  const habitProgress = totalHabits === 0 ? 0 : habitsDoneToday / totalHabits;

  const todayMeals = useMemo(
    () => meals.filter((meal) => meal.date === today),
    [meals, today]
  );
  const todayWorkouts = useMemo(
    () => workouts.filter((workout) => workout.date === today),
    [workouts, today]
  );
  const todayActivity = useMemo(
    () => dailyActivity.find((activity) => activity.date === today),
    [dailyActivity, today]
  );
  const weekActivity = useMemo(() => {
    const dates = lastNDates(7);
    return dates.map((date) => ({
      date,
      steps: dailyActivity
        .filter((activity) => activity.date === date)
        .reduce((sum, activity) => sum + activity.steps, 0),
    }));
  }, [dailyActivity]);
  const nutritionTargets = useMemo(
    () => getNutritionTargets(preferences),
    [preferences]
  );
  const mealTotals = useMemo(
    () =>
      todayMeals.reduce(
        (sum, meal) => ({
          calories: sum.calories + meal.calories,
          proteinG: sum.proteinG + meal.proteinG,
        }),
        { calories: 0, proteinG: 0 }
      ),
    [todayMeals]
  );
  const caloriePercentage = calculateCaloriePercentage(
    mealTotals.calories,
    nutritionTargets.calories
  );
  const proteinPercentage = calculateProteinPercentage(
    mealTotals.proteinG,
    nutritionTargets.proteinG
  );
  const habitPercentage = calculateHabitPercentage(habitsDoneToday, totalHabits);
  const movementGoal = Math.max(1, Number(preferences.movementGoal) || 8000);
  const stepsToday = todayActivity?.steps ?? 0;
  const stepPercentage = Math.max(0, Math.min(100, (stepsToday / movementGoal) * 100));
  const activityWorkoutLogged =
    (todayActivity?.workoutsCount ?? 0) > 0 || (todayActivity?.exerciseMinutes ?? 0) > 0;
  const hasWorkoutToday = todayWorkouts.length > 0 || activityWorkoutLogged;
  const workoutMinutes =
    todayWorkouts.reduce((sum, workout) => sum + workout.durationMinutes, 0) +
    (todayActivity?.exerciseMinutes ?? 0);
  const hasReflectionToday = moods.some((m) => m.date === today);
  const goalProgress = dashboardSummary.goalProgress;
  const calculatedDailyScore = calculateDailyScore({
    caloriePercentage,
    proteinPercentage,
    habitPercentage,
    workoutLogged: hasWorkoutToday,
    reflectionLogged: hasReflectionToday,
  });
  const dailyScore = dashboardSummary.dailyScore ?? calculatedDailyScore;
  const totalProgress = dailyScore / 100;

  const week = useMemo(() => lastNDates(7), []);
  const moodByDate = useMemo(() => {
    const map: Record<string, number> = {};
    for (const m of moods) map[m.date] = m.value;
    return map;
  }, [moods]);
  const openAddTask = useCallback(() => router.push('/modals/add-task'), [router]);
  const openHabits = useCallback(() => router.push('/(tabs)/habits'), [router]);
  const openReflect = useCallback(() => router.push('/(tabs)/reflect'), [router]);
  const openMeals = useCallback(() => router.push('/(tabs)/meals' as any), [router]);
  const openWorkouts = useCallback(() => router.push('/(tabs)/workouts' as any), [router]);
  const openActivity = useCallback(() => router.push('/(tabs)/activity' as any), [router]);

  return (
    <Screen>
      {/* Header */}
      <Animated.View entering={FadeInDown.duration(500)} style={{ gap: 6 }}>
        <Typo variant="eyebrow" color={Colors.accent}>
          {formatLongDate()}
        </Typo>
        <Typo
          style={{
            fontFamily: DisplayFont,
            fontSize: 40,
            lineHeight: 44,
            letterSpacing: -1,
            color: Colors.ink,
          }}
        >
          {greeting()},{'\n'}
          <Typo
            style={{
              fontFamily: DisplayFont,
              fontSize: 40,
              lineHeight: 44,
              letterSpacing: -1,
              fontStyle: 'italic',
              color: Colors.accent,
            }}
          >
            {preferences.name || 'friend'}.
          </Typo>
        </Typo>
        {preferences.focusStatement ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: 8,
              marginTop: 10,
            }}
          >
            <View
              style={{
                width: 3,
                alignSelf: 'stretch',
                backgroundColor: Colors.accent,
                marginTop: 4,
              }}
            />
            <Typo
              variant="body"
              italic
              color={Colors.inkSoft}
              style={{ flex: 1, fontSize: 16 }}
            >
              {preferences.focusStatement}
            </Typo>
          </View>
        ) : null}
      </Animated.View>

      {/* Daily progress */}
      <Animated.View entering={FadeInDown.delay(100).duration(500)}>
        <Card tone="raised" padding={22}>
          <View style={{ flexDirection: 'row', gap: 20, alignItems: 'center' }}>
            <ProgressRing
              size={118}
              strokeWidth={10}
              progress={totalProgress}
              color={Colors.accent}
            >
              <View style={{ alignItems: 'center', justifyContent: 'center', width: 82 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                  }}
                >
                  <Typo
                    style={{
                      fontFamily: Fonts.semiBold,
                      fontSize: 30,
                      lineHeight: 34,
                      color: Colors.ink,
                      fontVariant: ['tabular-nums' as const],
                    }}
                  >
                    {Math.round(totalProgress * 100)}
                  </Typo>
                  <Typo
                    style={{
                      fontFamily: Fonts.medium,
                      fontSize: 16,
                      lineHeight: 24,
                      color: Colors.inkSoft,
                    }}
                  >
                    %
                  </Typo>
                </View>
                <Typo
                  variant="eyebrow"
                  color={Colors.inkMuted}
                  align="center"
                  style={{ marginTop: 2 }}
                >
                  today
                </Typo>
              </View>
            </ProgressRing>
            <View style={{ flex: 1, gap: 12 }}>
              <Stat
                label="Calories"
                value={`${Math.round(mealTotals.calories)}/${nutritionTargets.calories}`}
                progress={caloriePercentage}
                color={Colors.accent}
              />
              <Stat
                label="Protein"
                value={`${Math.round(mealTotals.proteinG)}/${nutritionTargets.proteinG}g`}
                progress={proteinPercentage}
                color={Colors.mustard}
              />
              <Stat
                label="Steps"
                value={`${stepsToday}/${movementGoal}`}
                progress={stepPercentage}
                color={Colors.forest}
              />
            </View>
          </View>
          <View style={{ marginTop: 18, paddingTop: 16, borderTopWidth: 1, borderTopColor: Colors.borderSoft, gap: 10 }}>
            <Stat label="Burned" value={`${todayActivity?.caloriesBurned ?? 0} cal`} progress={todayActivity?.caloriesBurned ? 100 : 0} color={Colors.sky} />
            <Stat
              label="Workout"
              value={hasWorkoutToday ? `${workoutMinutes} min` : 'open'}
              progress={hasWorkoutToday ? 100 : 0}
              color={Colors.plum}
            />
            <Stat label="Habits" value={`${habitsDoneToday}/${totalHabits}`} progress={habitProgress} color={Colors.forest} />
            <Stat label="Goals" value={`${Math.round(goalProgress * 100)}%`} progress={goalProgress} color={Colors.ink} />
            <Stat label="Reflect" value={hasReflectionToday ? 'done' : 'open'} progress={hasReflectionToday ? 100 : 0} color={Colors.sky} />
          </View>
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(150).duration(500)} style={{ gap: 12 }}>
        <HeaderRow
          eyebrow="Fuel"
          title="Meals today"
          actionLabel={todayMeals.length ? 'Open' : 'Log meal'}
          actionIcon="arrow-forward"
          onAction={openMeals}
        />
        {todayMeals.length === 0 ? (
          <Card tone="outlined" padding={22}>
            <Typo variant="bodyEmphasis">No meals logged yet.</Typo>
            <Typo variant="body" color={Colors.inkMuted} style={{ marginTop: 4 }}>
              Log your first meal to fill calories and protein from real data.
            </Typo>
          </Card>
        ) : (
          <Card padding={18}>
            <Typo variant="bodyEmphasis">
              {Math.round(mealTotals.calories)} calories · {Math.round(mealTotals.proteinG)}g protein
            </Typo>
            <Typo variant="caption" color={Colors.inkMuted} style={{ marginTop: 4 }}>
              {todayMeals.length} {todayMeals.length === 1 ? 'meal' : 'meals'} logged today
            </Typo>
          </Card>
        )}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(180).duration(500)} style={{ gap: 12 }}>
        <HeaderRow
          eyebrow="Movement"
          title="Activity status"
          actionLabel={todayActivity ? 'Open' : 'Log'}
          actionIcon="arrow-forward"
          onAction={todayActivity ? openActivity : openWorkouts}
        />
        <Card tone={todayActivity || hasWorkoutToday ? 'default' : 'outlined'} padding={18} style={{ gap: 14 }}>
          <Typo variant="bodyEmphasis">
            {todayActivity
              ? `${stepsToday} steps · ${todayActivity.activeMinutes} active minutes`
              : hasWorkoutToday
                ? `${workoutMinutes} minutes logged`
                : 'No activity logged yet.'}
          </Typo>
          <Typo variant="body" color={Colors.inkMuted}>
            {todayActivity
              ? `${todayActivity.caloriesBurned} calories burned · ${Math.round(todayActivity.distanceMeters)} meters · ${todayActivity.source.replace('_', ' ')}.`
              : 'Connect Health Sync or add a manual walk, workout, or rest day when it happens.'}
          </Typo>
          <View style={{ flexDirection: 'row', gap: 6, alignItems: 'flex-end', height: 54 }}>
            {weekActivity.map((item) => {
              const ratio = Math.min(1, item.steps / movementGoal);
              return (
                <View key={item.date} style={{ flex: 1, alignItems: 'center', gap: 5 }}>
                  <View
                    style={{
                      width: 14,
                      height: Math.max(4, ratio * 42),
                      borderRadius: 7,
                      backgroundColor: item.date === today ? Colors.forest : Colors.border,
                    }}
                  />
                </View>
              );
            })}
          </View>
        </Card>
      </Animated.View>

      {/* Today's tasks */}
      <Animated.View entering={FadeInDown.delay(220).duration(500)} style={{ gap: 12 }}>
        <HeaderRow
          eyebrow="For today"
          title="The short list"
          actionLabel="Add"
          actionIcon="add"
          onAction={openAddTask}
        />
        {todayTasks.length === 0 ? (
          <Card tone="outlined" padding={24}>
            <View style={{ alignItems: 'center', gap: 8 }}>
              <Ionicons name="cafe-outline" size={28} color={Colors.inkMuted} />
              <Typo variant="bodyEmphasis" align="center">
                Nothing on today&apos;s desk.
              </Typo>
              <Typo variant="body" align="center" color={Colors.inkMuted}>
                Add one intentional task to get started.
              </Typo>
              <View style={{ marginTop: 8 }}>
                <Button
                  title="Add a task"
                  icon="add"
                  size="sm"
                  variant="secondary"
                  onPress={openAddTask}
                />
              </View>
            </View>
          </Card>
        ) : (
          <Card padding={0}>
            {todayTasks.map((t, i) => (
              <Pressable
                key={t.id}
                onPress={() => toggleTask(t.id)}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 14,
                  paddingHorizontal: 18,
                  paddingVertical: 16,
                  borderTopWidth: i === 0 ? 0 : 1,
                  borderTopColor: Colors.borderSoft,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Checkbox checked={t.done} onChange={() => toggleTask(t.id)} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Typo
                    variant="bodyEmphasis"
                    style={{
                      textDecorationLine: t.done ? 'line-through' : 'none',
                      color: t.done ? Colors.inkFaint : Colors.ink,
                    }}
                  >
                    {t.title}
                  </Typo>
                  {t.note ? (
                    <Typo variant="caption" numberOfLines={1}>
                      {t.note}
                    </Typo>
                  ) : null}
                </View>
              </Pressable>
            ))}
          </Card>
        )}
      </Animated.View>

      {/* Habits quick toggle */}
      <Animated.View entering={FadeInDown.delay(300).duration(500)} style={{ gap: 12 }}>
        <HeaderRow
          eyebrow="Rituals"
          title="Today&#39;s habits"
          actionLabel="See all"
          actionIcon="arrow-forward"
          onAction={openHabits}
        />
        {habits.length === 0 ? (
          <Card tone="outlined" padding={24}>
            <Typo variant="bodyEmphasis" align="center">
              No habits yet.
            </Typo>
            <Typo
              variant="body"
              align="center"
              color={Colors.inkMuted}
              style={{ marginTop: 4 }}
            >
              Build a ritual you can return to.
            </Typo>
          </Card>
        ) : (
          <View style={{ gap: 10 }}>
            {habits.slice(0, 3).map((h) => {
              const pair = accentPair(h.color);
              const done = !!h.completions[today];
              return (
                <Pressable
                  key={h.id}
                  onPress={() => toggleHabitToday(h.id)}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 14,
                    padding: 14,
                    borderRadius: Radii.lg,
                    backgroundColor: Colors.surface,
                    borderWidth: 1,
                    borderColor: done ? pair.base : Colors.borderSoft,
                    opacity: pressed ? 0.8 : 1,
                    boxShadow: done
                      ? 'none'
                      : '0 1px 2px rgba(20,19,17,0.04)',
                    borderCurve: 'continuous',
                  })}
                >
                  <IconBadge
                    name={h.icon as keyof typeof Ionicons.glyphMap}
                    color={pair.ink}
                    background={pair.soft}
                    size={40}
                  />
                  <View style={{ flex: 1, gap: 2 }}>
                    <Typo variant="bodyEmphasis">{h.title}</Typo>
                    <Typo variant="caption">
                      {h.streak > 0
                        ? `${h.streak} day${h.streak === 1 ? '' : 's'} streak`
                        : 'Start a streak today'}
                    </Typo>
                  </View>
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: done ? pair.base : 'transparent',
                      borderWidth: done ? 0 : 1.5,
                      borderColor: Colors.divider,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {done ? (
                      <Ionicons name="checkmark" size={18} color="#FBF8F0" />
                    ) : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </Animated.View>

      {/* Mood week */}
      <Animated.View entering={FadeInDown.delay(400).duration(500)} style={{ gap: 12 }}>
        <HeaderRow
          eyebrow="Wellbeing"
          title="Your week"
          actionLabel="Reflect"
          actionIcon="arrow-forward"
          onAction={openReflect}
        />
        <Card padding={20}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              height: 110,
            }}
          >
            {week.map((iso) => {
              const value = moodByDate[iso] ?? 0;
              const h = value > 0 ? (value / 5) * 80 + 8 : 4;
              const isToday = iso === today;
              return (
                <View key={iso} style={{ alignItems: 'center', gap: 8, flex: 1 }}>
                  <View
                    style={{
                      width: 20,
                      height: h,
                      borderRadius: 10,
                      backgroundColor:
                        value === 0
                          ? Colors.border
                          : isToday
                            ? Colors.accent
                            : Colors.ink,
                      borderCurve: 'continuous',
                    }}
                  />
                  <Typo
                    variant="label"
                    color={isToday ? Colors.accent : Colors.inkMuted}
                    style={{ fontSize: 10 }}
                  >
                    {dayLetter(iso)}
                  </Typo>
                </View>
              );
            })}
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 16,
              paddingTop: 16,
              borderTopWidth: 1,
              borderTopColor: Colors.borderSoft,
            }}
          >
            <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
              <Tag
                label={`${Object.keys(moodByDate).length} check-ins`}
                background={Colors.surfaceMuted}
                dotColor={Colors.accent}
              />
            </View>
            <Pressable
              onPress={openReflect}
              style={({ pressed }) => ({
                flexDirection: 'row',
                gap: 4,
                alignItems: 'center',
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <Typo variant="bodyEmphasis" color={Colors.ink}>
                Log today
              </Typo>
              <Ionicons name="arrow-forward" size={14} color={Colors.ink} />
            </Pressable>
          </View>
        </Card>
      </Animated.View>
    </Screen>
  );
}

function Stat({
  label,
  value,
  progress,
  color,
}: {
  label: string;
  value: string;
  progress: number;
  color: string;
}) {
  return (
    <View style={{ gap: 7 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'baseline',
        }}
      >
        <Typo
          variant="body"
          color={Colors.inkSoft}
          style={{ fontSize: 16, lineHeight: 20 }}
        >
          {label}
        </Typo>
        <Typo
          variant="bodyEmphasis"
          color={Colors.ink}
          style={{ fontSize: 18, lineHeight: 22, fontVariant: ['tabular-nums' as const] }}
        >
          {value}
        </Typo>
      </View>
      <ProgressBar progress={progress} color={color} height={8} />
    </View>
  );
}

function HeaderRow({
  eyebrow,
  title,
  actionLabel,
  actionIcon,
  onAction,
}: {
  eyebrow: string;
  title: string;
  actionLabel: string;
  actionIcon: keyof typeof Ionicons.glyphMap;
  onAction: () => void;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
      }}
    >
      <View style={{ gap: 4 }}>
        <Typo variant="eyebrow" color={Colors.inkMuted}>
          {eyebrow}
        </Typo>
        <Typo variant="heading">{title}</Typo>
      </View>
      <Pressable
        onPress={onAction}
        accessibilityRole="button"
        accessibilityLabel={actionLabel}
        hitSlop={8}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          paddingVertical: 6,
          paddingHorizontal: 4,
          opacity: pressed ? 0.6 : 1,
        })}
      >
        <Typo variant="bodyEmphasis" color={Colors.accent}>
          {actionLabel}
        </Typo>
        <Ionicons name={actionIcon} size={14} color={Colors.accent} />
      </Pressable>
    </View>
  );
}
