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
import { Colors, DisplayFont, Radii } from '@/constants/Theme';
import { getTodayISO, useAppStore } from '@/store/useAppStore';
import type { WorkoutLog, WorkoutType } from '@/store/types';

const WORKOUT_TYPES: WorkoutType[] = ['gym', 'home', 'cardio', 'walking', 'rest day'];

const emptyForm = {
  workoutType: 'gym' as WorkoutType,
  durationMinutes: '',
  exerciseName: '',
  sets: '',
  reps: '',
  weight: '',
  notes: '',
};

export default function WorkoutsScreen() {
  const workouts = useAppStore((s) => s.workouts);
  const loadWorkouts = useAppStore((s) => s.loadWorkouts);
  const addWorkout = useAppStore((s) => s.addWorkout);
  const updateWorkout = useAppStore((s) => s.updateWorkout);
  const deleteWorkout = useAppStore((s) => s.deleteWorkout);

  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<WorkoutLog | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadWorkouts().catch(() => {});
  }, [loadWorkouts]);

  const today = getTodayISO();
  const todayWorkouts = useMemo(
    () => workouts.filter((workout) => workout.date === today),
    [today, workouts]
  );
  const totalMinutes = useMemo(
    () => todayWorkouts.reduce((sum, workout) => sum + workout.durationMinutes, 0),
    [todayWorkouts]
  );
  const hasRestDay = todayWorkouts.some((workout) => workout.workoutType === 'rest day');
  const completed = todayWorkouts.length > 0;

  const reset = () => {
    setForm(emptyForm);
    setEditing(null);
  };

  const submit = async () => {
    setSaving(true);
    const payload = {
      workoutType: form.workoutType,
      durationMinutes: Number(form.durationMinutes) || 0,
      exerciseName: form.exerciseName,
      sets: Number(form.sets) || undefined,
      reps: Number(form.reps) || undefined,
      weight: Number(form.weight) || undefined,
      notes: form.notes,
      date: today,
    };
    try {
      if (editing) {
        await updateWorkout(editing.id, payload);
      } else {
        await addWorkout(payload);
      }
      reset();
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (workout: WorkoutLog) => {
    setEditing(workout);
    setForm({
      workoutType: workout.workoutType,
      durationMinutes: String(workout.durationMinutes || ''),
      exerciseName: workout.exerciseName ?? '',
      sets: workout.sets ? String(workout.sets) : '',
      reps: workout.reps ? String(workout.reps) : '',
      weight: workout.weight ? String(workout.weight) : '',
      notes: workout.notes ?? '',
    });
  };

  const remove = (workout: WorkoutLog) => {
    const run = () => deleteWorkout(workout.id).catch(() => {});
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm(`Delete ${workout.workoutType}?`)) run();
      return;
    }
    Alert.alert(`Delete ${workout.workoutType}?`, undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: run },
    ]);
  };

  return (
    <Screen>
      <Animated.View entering={FadeInDown.duration(500)} style={{ gap: 6 }}>
        <Typo variant="eyebrow" color={Colors.accent}>
          Workouts · motion
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
          Move what{'\n'}
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
            matters.
          </Typo>
        </Typo>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(100).duration(500)}>
        <Card tone="raised" padding={22}>
          <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 28,
                backgroundColor: completed ? Colors.forestSoft : Colors.surfaceMuted,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons
                name={hasRestDay ? 'bed-outline' : completed ? 'checkmark' : 'barbell-outline'}
                size={28}
                color={completed ? Colors.forest : Colors.inkMuted}
              />
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Typo variant="eyebrow" color={Colors.inkMuted}>
                Today&apos;s status
              </Typo>
              <Typo variant="heading">
                {hasRestDay ? 'Rest day logged' : completed ? `${totalMinutes} minutes logged` : 'No workout yet'}
              </Typo>
              <Typo variant="caption" color={Colors.inkMuted}>
                {completed ? `${todayWorkouts.length} activity ${todayWorkouts.length === 1 ? 'entry' : 'entries'}` : 'Log a workout or mark a rest day.'}
              </Typo>
            </View>
          </View>
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(150).duration(500)}>
        <Card padding={20}>
          <View style={{ gap: 14 }}>
            <Typo variant="eyebrow" color={Colors.inkMuted}>
              {editing ? 'Edit workout' : 'Add workout'}
            </Typo>
            <Segmented
              options={WORKOUT_TYPES}
              value={form.workoutType}
              onChange={(workoutType) => setForm((current) => ({ ...current, workoutType }))}
            />
            <TextField
              label="Duration"
              value={form.durationMinutes}
              onChangeText={(durationMinutes) => setForm((current) => ({ ...current, durationMinutes }))}
              keyboardType="numeric"
              placeholder="Minutes"
            />
            <TextField
              label="Exercise"
              value={form.exerciseName}
              onChangeText={(exerciseName) => setForm((current) => ({ ...current, exerciseName }))}
              placeholder="Optional exercise"
            />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <TextField label="Sets" value={form.sets} onChangeText={(sets) => setForm((current) => ({ ...current, sets }))} keyboardType="numeric" />
              </View>
              <View style={{ flex: 1 }}>
                <TextField label="Reps" value={form.reps} onChangeText={(reps) => setForm((current) => ({ ...current, reps }))} keyboardType="numeric" />
              </View>
              <View style={{ flex: 1 }}>
                <TextField label="Weight" value={form.weight} onChangeText={(weight) => setForm((current) => ({ ...current, weight }))} keyboardType="numeric" />
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
                title={editing ? 'Save workout' : 'Log workout'}
                icon={editing ? 'checkmark' : 'add'}
                onPress={submit}
                loading={saving}
                fullWidth
              />
              {editing ? <Button title="Cancel" variant="secondary" onPress={reset} /> : null}
            </View>
          </View>
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(500)} style={{ gap: 12 }}>
        <Typo variant="eyebrow" color={Colors.inkMuted}>
          Today&apos;s activity
        </Typo>
        {todayWorkouts.length === 0 ? (
          <EmptyState
            icon="barbell-outline"
            title="No workout logged"
            description="Add a workout, walk, or rest day to make today&apos;s movement real."
          />
        ) : (
          <View style={{ gap: 10 }}>
            {todayWorkouts.map((workout) => (
              <WorkoutCard key={workout.id} workout={workout} onEdit={startEdit} onDelete={remove} />
            ))}
          </View>
        )}
      </Animated.View>
    </Screen>
  );
}

function Segmented<T extends string>({ options, value, onChange }: { options: T[]; value: T; onChange: (value: T) => void }) {
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

function WorkoutCard({ workout, onEdit, onDelete }: { workout: WorkoutLog; onEdit: (workout: WorkoutLog) => void; onDelete: (workout: WorkoutLog) => void }) {
  return (
    <Card padding={18}>
      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
        <View
          style={{
            width: 42,
            height: 42,
            borderRadius: 18,
            backgroundColor: Colors.forestSoft,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name={workout.workoutType === 'rest day' ? 'bed-outline' : 'barbell-outline'} size={20} color={Colors.forest} />
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Typo variant="bodyEmphasis">{workout.workoutType}</Typo>
          <Typo variant="caption" color={Colors.inkMuted}>
            {workout.durationMinutes} min{workout.exerciseName ? ` · ${workout.exerciseName}` : ''}
          </Typo>
          {workout.sets || workout.reps || workout.weight ? (
            <Typo variant="caption">
              {[workout.sets ? `${workout.sets} sets` : null, workout.reps ? `${workout.reps} reps` : null, workout.weight ? `${workout.weight} lb` : null]
                .filter(Boolean)
                .join(' · ')}
            </Typo>
          ) : null}
          {workout.notes ? <Typo variant="caption">{workout.notes}</Typo> : null}
        </View>
        <Pressable onPress={() => onEdit(workout)} hitSlop={8} style={{ padding: 4 }}>
          <Ionicons name="create-outline" size={18} color={Colors.inkMuted} />
        </Pressable>
        <Pressable onPress={() => onDelete(workout)} hitSlop={8} style={{ padding: 4 }}>
          <Ionicons name="trash-outline" size={18} color={Colors.inkMuted} />
        </Pressable>
      </View>
    </Card>
  );
}
