import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/screen';
import { Card } from '@/components/card';
import { Button } from '@/components/button';
import { Typo } from '@/components/typography';
import { RecipeInstructionList } from '@/components/recipe-instruction-list';
import { SuggestionVisualPlaceholder } from '@/components/suggestion-visual-placeholder';
import { Colors, DisplayFont, Radii } from '@/constants/Theme';
import { getTodayISO, useAppStore } from '@/store/useAppStore';
import { getMealSuggestionById } from '@/utils/suggestions';

export default function MealDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const addMeal = useAppStore((s) => s.addMeal);
  const meal = params.id ? getMealSuggestionById(params.id) : undefined;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logMeal = async () => {
    if (!meal) return;
    setSaving(true);
    setError(null);
    try {
      await addMeal({
        mealType: meal.mealType,
        foodName: meal.name,
        calories: meal.calories,
        proteinG: meal.proteinG,
        carbsG: meal.carbsG,
        fatG: meal.fatG,
        notes: meal.notes,
        date: getTodayISO(),
        source: 'suggested',
        templateId: meal.id,
        loggedAt: new Date().toISOString(),
      });
      router.replace('/(tabs)/meals');
    } catch (saveError) {
      if (__DEV__) console.warn('Suggested meal save failed', saveError);
      setError('Could not add this meal. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!meal) {
    return (
      <Screen withTabBar={false} bottomPadding={28}>
        <Header onBack={() => router.back()} />
        <Card padding={20}>
          <Typo variant="heading">Meal not found</Typo>
          <Typo variant="body" color={Colors.inkMuted}>
            This recommendation is no longer available.
          </Typo>
          <Button title="Back" variant="secondary" onPress={() => router.back()} />
        </Card>
      </Screen>
    );
  }

  return (
    <Screen withTabBar={false} bottomPadding={28}>
      <Header onBack={() => router.back()} />

      <View style={{ gap: 8 }}>
        <Typo variant="eyebrow" color={Colors.accent}>
          {meal.category} · {meal.goalTags.slice(0, 2).join(' · ')}
        </Typo>
        <Typo
          style={{
            fontFamily: DisplayFont,
            fontSize: 38,
            lineHeight: 42,
            letterSpacing: -1,
            color: Colors.ink,
          }}
        >
          {meal.name}
        </Typo>
        <Typo variant="body" color={Colors.inkSoft}>
          {meal.description}
        </Typo>
      </View>

      <Card tone="raised" padding={18}>
        <View style={{ gap: 14 }}>
          <SuggestionVisualPlaceholder label="Recipe guide" icon="restaurant-outline" />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
            <Macro label="Calories" value={`${meal.calories}`} />
            <Macro label="Protein" value={`${meal.proteinG}g`} />
            <Macro label="Carbs" value={`${meal.carbsG}g`} />
            <Macro label="Fat" value={`${meal.fatG}g`} />
          </View>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            <Tag label={`${meal.prepTimeMinutes} min prep`} />
            <Tag label={`${meal.cookTimeMinutes} min cook`} />
            <Tag label={meal.servingSize} />
          </View>
        </View>
      </Card>

      <RecipeInstructionList title="Ingredients" items={meal.ingredients} />
      <RecipeInstructionList title="Recipe steps" items={meal.instructions} />
      {meal.substitutions?.length ? (
        <RecipeInstructionList title="Substitutions" items={meal.substitutions} />
      ) : null}
      {meal.notes ? (
        <Card padding={16}>
          <Typo variant="eyebrow" color={Colors.inkMuted}>
            Notes
          </Typo>
          <Typo variant="body">{meal.notes}</Typo>
        </Card>
      ) : null}

      {error ? (
        <Typo variant="caption" color={Colors.error}>
          {error}
        </Typo>
      ) : null}

      <View style={{ gap: 10 }}>
        <Button title="Add to Today" icon="add" onPress={logMeal} loading={saving} fullWidth />
        <Button title="Cancel" variant="secondary" onPress={() => router.back()} disabled={saving} fullWidth />
      </View>
    </Screen>
  );
}

function Header({ onBack }: { onBack: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Back"
      onPress={onBack}
      hitSlop={10}
      style={{
        width: 42,
        height: 42,
        borderRadius: Radii.pill,
        borderWidth: 1,
        borderColor: Colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.bgElevated,
      }}
    >
      <Ionicons name="chevron-back" size={20} color={Colors.ink} />
    </Pressable>
  );
}

function Macro({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1, gap: 2 }}>
      <Typo variant="heading" style={{ fontSize: 19, lineHeight: 23 }}>
        {value}
      </Typo>
      <Typo variant="caption" color={Colors.inkMuted}>
        {label}
      </Typo>
    </View>
  );
}

function Tag({ label }: { label: string }) {
  return (
    <View
      style={{
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: Radii.pill,
        backgroundColor: Colors.surfaceMuted,
        borderWidth: 1,
        borderColor: Colors.border,
      }}
    >
      <Typo variant="caption">{label}</Typo>
    </View>
  );
}
