import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/screen';
import { Card } from '@/components/card';
import { Button } from '@/components/button';
import { ProgressBar } from '@/components/progress-bar';
import { Typo } from '@/components/typography';
import { WorkoutStepChecklist } from '@/components/workout-step-checklist';
import { SuggestionVisualPlaceholder } from '@/components/suggestion-visual-placeholder';
import { Colors, DisplayFont, Radii } from '@/constants/Theme';
import { getTodayISO, useAppStore } from '@/store/useAppStore';
import { calculateChecklistProgress } from '@/utils/lifeops-logic';
import { getWorkoutSuggestionById } from '@/utils/suggestions';

export default function WorkoutDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const addWorkout = useAppStore((s) => s.addWorkout);
  const suggestion = params.id ? getWorkoutSuggestionById(params.id) : undefined;
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const progress = useMemo(
    () => calculateChecklistProgress(checkedIds.length, suggestion?.steps.length ?? 0),
    [checkedIds.length, suggestion?.steps.length]
  );

  const toggleStep = (stepId: string) => {
    setCheckedIds((current) =>
      current.includes(stepId) ? current.filter((id) => id !== stepId) : [...current, stepId]
    );
  };

  const completeWorkout = async () => {
    if (!suggestion) return;
    setSaving(true);
    setError(null);
    try {
      await addWorkout({
        workoutType: suggestion.workoutType,
        durationMinutes: suggestion.durationMinutes,
        exerciseName: suggestion.exerciseName ?? suggestion.title,
        sets: suggestion.sets,
        reps: suggestion.reps,
        notes: suggestion.description,
        date: getTodayISO(),
        source: 'suggested',
        templateId: suggestion.id,
        completedStepsCount: checkedIds.length,
        totalStepsCount: suggestion.steps.length,
        estimatedCalories: Math.round((suggestion.estimatedCaloriesMin + suggestion.estimatedCaloriesMax) / 2),
        completedAt: new Date().toISOString(),
      });
      router.replace('/(tabs)/workouts');
    } catch (saveError) {
      if (__DEV__) console.warn('Suggested workout completion failed', saveError);
      setError('Could not save this workout. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!suggestion) {
    return (
      <Screen withTabBar={false} bottomPadding={28}>
        <Header onBack={() => router.back()} />
        <Card padding={20}>
          <Typo variant="heading">Workout not found</Typo>
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
          {suggestion.category} · {suggestion.difficulty}
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
          {suggestion.title}
        </Typo>
        <Typo variant="body" color={Colors.inkSoft}>
          {suggestion.description}
        </Typo>
      </View>

      <Card tone="raised" padding={18}>
        <View style={{ gap: 14 }}>
          <SuggestionVisualPlaceholder label="Workout guide" icon="barbell-outline" />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
            <Metric label="Duration" value={`${suggestion.durationMinutes} min`} />
            <Metric label="Calories" value={`${suggestion.estimatedCaloriesMin}-${suggestion.estimatedCaloriesMax}`} />
            <Metric label="Steps" value={`${checkedIds.length}/${suggestion.steps.length}`} />
          </View>
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Typo variant="label">Workout progress</Typo>
              <Typo variant="label" color={Colors.inkMuted}>
                {Math.round(progress)}%
              </Typo>
            </View>
            <ProgressBar progress={progress} color={Colors.forest} height={8} />
          </View>
        </View>
      </Card>

      <InfoSection title="Equipment" values={suggestion.equipment} />
      <InfoSection title="Target / benefit" values={[...suggestion.targetMuscles, ...suggestion.benefits]} />

      <View style={{ gap: 12 }}>
        <Typo variant="eyebrow" color={Colors.inkMuted}>
          Follow along
        </Typo>
        <WorkoutStepChecklist steps={suggestion.steps} checkedIds={checkedIds} onToggle={toggleStep} />
      </View>

      {error ? (
        <Typo variant="caption" color={Colors.error}>
          {error}
        </Typo>
      ) : null}

      <View style={{ gap: 10 }}>
        <Button
          title="Complete Workout"
          icon="checkmark"
          onPress={completeWorkout}
          loading={saving}
          fullWidth
        />
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1, gap: 2 }}>
      <Typo variant="heading" style={{ fontSize: 20, lineHeight: 24 }}>
        {value}
      </Typo>
      <Typo variant="caption" color={Colors.inkMuted}>
        {label}
      </Typo>
    </View>
  );
}

function InfoSection({ title, values }: { title: string; values: string[] }) {
  return (
    <View style={{ gap: 8 }}>
      <Typo variant="eyebrow" color={Colors.inkMuted}>
        {title}
      </Typo>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {values.map((value) => (
          <View
            key={value}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: Radii.pill,
              backgroundColor: Colors.surfaceMuted,
              borderWidth: 1,
              borderColor: Colors.border,
            }}
          >
            <Typo variant="caption">{value}</Typo>
          </View>
        ))}
      </View>
    </View>
  );
}
