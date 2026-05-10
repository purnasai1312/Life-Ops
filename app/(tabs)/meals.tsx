import { useEffect, useMemo, useState } from 'react';
import { Alert, Platform, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Screen } from '@/components/screen';
import { Typo } from '@/components/typography';
import { Card } from '@/components/card';
import { Button } from '@/components/button';
import { TextField } from '@/components/text-field';
import { EmptyState } from '@/components/empty-state';
import { ProgressBar } from '@/components/progress-bar';
import { Colors, DisplayFont, Radii } from '@/constants/Theme';
import {
  calculateCaloriePercentage,
  calculateProteinPercentage,
  getNutritionTargets,
  getTodayISO,
  useAppStore,
} from '@/store/useAppStore';
import type { MealEntry, MealType } from '@/store/types';
import { formatShortDate, lastNDates } from '@/utils/date';
import { getMealSuggestions } from '@/utils/suggestions';

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

const emptyForm = {
  mealType: 'breakfast' as MealType,
  foodName: '',
  calories: '',
  proteinG: '',
  carbsG: '',
  fatG: '',
  notes: '',
};

export default function MealsScreen() {
  const preferences = useAppStore((s) => s.preferences);
  const meals = useAppStore((s) => s.meals);
  const loadMeals = useAppStore((s) => s.loadMeals);
  const addMeal = useAppStore((s) => s.addMeal);
  const updateMeal = useAppStore((s) => s.updateMeal);
  const deleteMeal = useAppStore((s) => s.deleteMeal);

  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<MealEntry | null>(null);
  const [saving, setSaving] = useState(false);
  const [range, setRange] = useState<'today' | '7' | '30'>('today');

  useEffect(() => {
    loadMeals().catch(() => {});
  }, [loadMeals]);

  const today = getTodayISO();
  const todayMeals = useMemo(
    () => meals.filter((meal) => meal.date === today),
    [meals, today]
  );
  const totals = useMemo(
    () =>
      todayMeals.reduce(
        (sum, meal) => ({
          calories: sum.calories + meal.calories,
          proteinG: sum.proteinG + meal.proteinG,
          carbsG: sum.carbsG + meal.carbsG,
          fatG: sum.fatG + meal.fatG,
        }),
        { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 }
      ),
    [todayMeals]
  );
  const targets = useMemo(() => getNutritionTargets(preferences), [preferences]);
  const caloriePct = calculateCaloriePercentage(totals.calories, targets.calories);
  const proteinPct = calculateProteinPercentage(totals.proteinG, targets.proteinG);
  const suggestions = useMemo(() => getMealSuggestions(preferences), [preferences]);
  const rangeDates = useMemo(
    () => (range === 'today' ? [today] : lastNDates(range === '7' ? 7 : 30)),
    [range, today]
  );
  const historyMeals = useMemo(
    () => meals.filter((meal) => rangeDates.includes(meal.date)),
    [meals, rangeDates]
  );
  const groupedMeals = useMemo(() => groupMeals(historyMeals), [historyMeals]);

  const reset = () => {
    setForm(emptyForm);
    setEditing(null);
  };

  const submit = async () => {
    if (!form.foodName.trim()) return;
    setSaving(true);
    const payload = {
      mealType: form.mealType,
      foodName: form.foodName,
      calories: Number(form.calories) || 0,
      proteinG: Number(form.proteinG) || 0,
      carbsG: Number(form.carbsG) || 0,
      fatG: Number(form.fatG) || 0,
      notes: form.notes,
      date: today,
    };
    try {
      if (editing) {
        await updateMeal(editing.id, payload);
      } else {
        await addMeal(payload);
      }
      reset();
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (meal: MealEntry) => {
    setEditing(meal);
    setForm({
      mealType: meal.mealType,
      foodName: meal.foodName,
      calories: String(meal.calories || ''),
      proteinG: String(meal.proteinG || ''),
      carbsG: String(meal.carbsG || ''),
      fatG: String(meal.fatG || ''),
      notes: meal.notes ?? '',
    });
  };

  const remove = (meal: MealEntry) => {
    const run = () => deleteMeal(meal.id).catch(() => {});
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm(`Delete ${meal.foodName}?`)) run();
      return;
    }
    Alert.alert(`Delete ${meal.foodName}?`, undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: run },
    ]);
  };

  return (
    <Screen>
      <Animated.View entering={FadeInDown.duration(500)} style={{ gap: 6 }}>
        <Typo variant="eyebrow" color={Colors.accent}>
          Meals · fuel
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
          Eat with{'\n'}
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
            intention.
          </Typo>
        </Typo>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(100).duration(500)}>
        <Card tone="raised" padding={22}>
          <View style={{ gap: 16 }}>
            <Metric label="Calories" value={`${Math.round(totals.calories)}`} target={targets.calories} percent={caloriePct} color={Colors.accent} />
            <Metric label="Protein" value={`${Math.round(totals.proteinG)}g`} target={targets.proteinG} percent={proteinPct} color={Colors.forest} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <SmallTotal label="Carbs" value={`${Math.round(totals.carbsG)}g`} />
              <SmallTotal label="Fat" value={`${Math.round(totals.fatG)}g`} />
              <SmallTotal label="Meals" value={`${todayMeals.length}`} />
            </View>
          </View>
        </Card>
      </Animated.View>

      {suggestions.length > 0 ? (
        <Animated.View entering={FadeInDown.delay(125).duration(500)} style={{ gap: 12 }}>
          <Typo variant="eyebrow" color={Colors.inkMuted}>
            Suggested for your goal
          </Typo>
          <View style={{ gap: 10 }}>
            {suggestions.map((meal) => (
              <Card key={meal.title} padding={16}>
                <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Typo variant="bodyEmphasis">{meal.title}</Typo>
                    <Typo variant="caption" color={Colors.inkMuted}>
                      {meal.calories} cal · {meal.proteinG}g protein · {meal.mealType}
                    </Typo>
                  </View>
                  <Button
                    title="Add"
                    icon="add"
                    size="sm"
                    variant="secondary"
                    onPress={() =>
                      addMeal({
                        mealType: meal.mealType,
                        foodName: meal.title,
                        calories: meal.calories,
                        proteinG: meal.proteinG,
                        carbsG: meal.carbsG,
                        fatG: meal.fatG,
                        notes: meal.notes,
                        date: today,
                      }).catch(() => {})
                    }
                  />
                </View>
              </Card>
            ))}
          </View>
        </Animated.View>
      ) : null}

      <Animated.View entering={FadeInDown.delay(150).duration(500)}>
        <Card padding={20}>
          <View style={{ gap: 14 }}>
            <Typo variant="eyebrow" color={Colors.inkMuted}>
              {editing ? 'Edit meal' : 'Add meal'}
            </Typo>
            <Segmented
              options={MEAL_TYPES}
              value={form.mealType}
              onChange={(mealType) => setForm((current) => ({ ...current, mealType }))}
            />
            <TextField
              label="Food name"
              value={form.foodName}
              onChangeText={(foodName) => setForm((current) => ({ ...current, foodName }))}
              placeholder="Greek yogurt, eggs, rice bowl..."
            />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <TextField
                  label="Calories"
                  value={form.calories}
                  onChangeText={(calories) => setForm((current) => ({ ...current, calories }))}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <TextField
                  label="Protein"
                  value={form.proteinG}
                  onChangeText={(proteinG) => setForm((current) => ({ ...current, proteinG }))}
                  keyboardType="numeric"
                />
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <TextField
                  label="Carbs"
                  value={form.carbsG}
                  onChangeText={(carbsG) => setForm((current) => ({ ...current, carbsG }))}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <TextField
                  label="Fat"
                  value={form.fatG}
                  onChangeText={(fatG) => setForm((current) => ({ ...current, fatG }))}
                  keyboardType="numeric"
                />
              </View>
            </View>
            <TextField
              label="Notes"
              value={form.notes}
              onChangeText={(notes) => setForm((current) => ({ ...current, notes }))}
              placeholder="Optional"
              multiline
            />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button
                title={editing ? 'Save meal' : 'Log meal'}
                icon={editing ? 'checkmark' : 'add'}
                onPress={submit}
                disabled={!form.foodName.trim()}
                loading={saving}
                fullWidth
              />
              {editing ? (
                <Button title="Cancel" variant="secondary" onPress={reset} />
              ) : null}
            </View>
          </View>
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(500)} style={{ gap: 12 }}>
        <View style={{ gap: 10 }}>
          <Typo variant="eyebrow" color={Colors.inkMuted}>
            Meal history
          </Typo>
          <Segmented
            options={['today', '7', '30'] as const}
            value={range}
            onChange={setRange}
          />
        </View>
        {historyMeals.length === 0 ? (
          <EmptyState
            icon="restaurant-outline"
            title="No meals logged"
            description="Log your first meal to see calories, protein, and daily totals here."
          />
        ) : (
          <View style={{ gap: 10 }}>
            {groupedMeals.map((group) => (
              <Card key={group.date} padding={0}>
                <View style={{ padding: 16, gap: 4, borderBottomWidth: 1, borderBottomColor: Colors.borderSoft }}>
                  <Typo variant="bodyEmphasis">{group.date === today ? 'Today' : formatShortDate(group.date)}</Typo>
                  <Typo variant="caption" color={Colors.inkMuted}>
                    {Math.round(group.calories)} calories · {Math.round(group.proteinG)}g protein
                  </Typo>
                </View>
                <View style={{ gap: 0 }}>
                  {group.items.map((meal) => (
                    <MealCard key={meal.id} meal={meal} onEdit={startEdit} onDelete={remove} flat />
                  ))}
                </View>
              </Card>
            ))}
          </View>
        )}
      </Animated.View>
    </Screen>
  );
}

function Metric({ label, value, target, percent, color }: { label: string; value: string; target: number; percent: number; color: string }) {
  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Typo variant="bodyEmphasis">{label}</Typo>
        <Typo variant="bodyEmphasis" style={{ fontVariant: ['tabular-nums' as const] }}>
          {value}
          <Typo variant="caption" color={Colors.inkMuted}> / {target}</Typo>
        </Typo>
      </View>
      <ProgressBar progress={percent} color={color} height={8} />
    </View>
  );
}

function SmallTotal({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ alignItems: 'center', flex: 1, gap: 2 }}>
      <Typo variant="heading" style={{ fontSize: 22, lineHeight: 26 }}>{value}</Typo>
      <Typo variant="caption" color={Colors.inkMuted}>{label}</Typo>
    </View>
  );
}

function Segmented<T extends string>({ options, value, onChange }: { options: readonly T[]; value: T; onChange: (value: T) => void }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {options.map((option) => {
        const active = option === value;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            style={({ pressed }) => ({
              paddingHorizontal: 12,
              paddingVertical: 9,
              borderRadius: Radii.pill,
              backgroundColor: active ? Colors.ink : Colors.surfaceMuted,
              opacity: pressed ? 0.75 : 1,
            })}
          >
            <Typo variant="label" color={active ? Colors.bgElevated : Colors.inkSoft}>
              {option}
            </Typo>
          </Pressable>
        );
      })}
    </View>
  );
}

function MealCard({ meal, onEdit, onDelete, flat }: { meal: MealEntry; onEdit: (meal: MealEntry) => void; onDelete: (meal: MealEntry) => void; flat?: boolean }) {
  const content = (
    <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 18,
          backgroundColor: Colors.accentSoft,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name="restaurant-outline" size={20} color={Colors.accentInk} />
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <Typo variant="bodyEmphasis">{meal.foodName}</Typo>
        <Typo variant="caption" color={Colors.inkMuted}>
          {meal.mealType} · {Math.round(meal.calories)} cal · {Math.round(meal.proteinG)}g protein
        </Typo>
        {meal.notes ? <Typo variant="caption">{meal.notes}</Typo> : null}
      </View>
      <Pressable onPress={() => onEdit(meal)} hitSlop={8} style={{ padding: 4 }}>
        <Ionicons name="create-outline" size={18} color={Colors.inkMuted} />
      </Pressable>
      <Pressable onPress={() => onDelete(meal)} hitSlop={8} style={{ padding: 4 }}>
        <Ionicons name="trash-outline" size={18} color={Colors.inkMuted} />
      </Pressable>
    </View>
  );
  if (flat) return <View style={{ padding: 16 }}>{content}</View>;
  return (
    <Card padding={18}>
      {content}
    </Card>
  );
}

function groupMeals(meals: MealEntry[]) {
  const map = new Map<string, MealEntry[]>();
  for (const meal of meals) map.set(meal.date, [...(map.get(meal.date) ?? []), meal]);
  return [...map.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, items]) => ({
      date,
      items,
      calories: items.reduce((sum, meal) => sum + meal.calories, 0),
      proteinG: items.reduce((sum, meal) => sum + meal.proteinG, 0),
    }));
}
