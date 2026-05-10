import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Screen } from '@/components/screen';
import { Typo } from '@/components/typography';
import { Card } from '@/components/card';
import { Button } from '@/components/button';
import { TextField } from '@/components/text-field';
import { Colors, DisplayFont } from '@/constants/Theme';
import { useAuth } from '@/lib/auth';
import { useAppStore } from '@/store/useAppStore';

export default function ProfileScreen() {
  const { signOut, user } = useAuth();
  const preferences = useAppStore((s) => s.preferences);
  const loadProfile = useAppStore((s) => s.loadProfile);
  const saveProfile = useAppStore((s) => s.saveProfile);
  const resetAll = useAppStore((s) => s.resetAll);

  const [form, setForm] = useState({
    name: preferences.name,
    age: preferences.age ?? '',
    height: preferences.height ?? '',
    weight: preferences.weight ?? '',
    goal: preferences.goal ?? '',
    activityLevel: preferences.activityLevel ?? '',
    dietPreference: preferences.dietPreference ?? '',
    workoutPreference: preferences.workoutPreference ?? '',
    focusStatement: preferences.focusStatement,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadProfile().catch(() => {});
  }, [loadProfile]);

  useEffect(() => {
    setForm({
      name: preferences.name,
      age: preferences.age ?? '',
      height: preferences.height ?? '',
      weight: preferences.weight ?? '',
      goal: preferences.goal ?? '',
      activityLevel: preferences.activityLevel ?? '',
      dietPreference: preferences.dietPreference ?? '',
      workoutPreference: preferences.workoutPreference ?? '',
      focusStatement: preferences.focusStatement,
    });
  }, [preferences]);

  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await saveProfile(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 1600);
    } finally {
      setSaving(false);
    }
  };

  const logout = async () => {
    await signOut();
    resetAll();
  };

  return (
    <Screen>
      <Animated.View entering={FadeInDown.duration(500)} style={{ gap: 6 }}>
        <Typo variant="eyebrow" color={Colors.accent}>
          Profile · settings
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
          Your operating{'\n'}
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
            details.
          </Typo>
        </Typo>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(100).duration(500)}>
        <Card tone="raised" padding={20}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View
              style={{
                width: 58,
                height: 58,
                borderRadius: 24,
                backgroundColor: Colors.surfaceMuted,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="person-circle-outline" size={32} color={Colors.inkMuted} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Typo variant="bodyEmphasis">{form.name || 'LifeOps user'}</Typo>
              <Typo variant="caption" color={Colors.inkMuted}>
                {user?.email ?? 'Signed in with Supabase'}
              </Typo>
            </View>
          </View>
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(150).duration(500)}>
        <Card padding={20}>
          <View style={{ gap: 14 }}>
            <Typo variant="eyebrow" color={Colors.inkMuted}>
              Personal data
            </Typo>
            <TextField label="Name" value={form.name} onChangeText={(name) => setForm((current) => ({ ...current, name }))} />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <TextField label="Age" value={form.age} onChangeText={(age) => setForm((current) => ({ ...current, age }))} keyboardType="numeric" />
              </View>
              <View style={{ flex: 1 }}>
                <TextField label="Height" value={form.height} onChangeText={(height) => setForm((current) => ({ ...current, height }))} placeholder="5'10" />
              </View>
              <View style={{ flex: 1 }}>
                <TextField label="Weight" value={form.weight} onChangeText={(weight) => setForm((current) => ({ ...current, weight }))} keyboardType="numeric" />
              </View>
            </View>
            <TextField label="Goal" value={form.goal} onChangeText={(goal) => setForm((current) => ({ ...current, goal }))} placeholder="Maintain energy, lose weight, build muscle..." />
            <TextField label="Activity level" value={form.activityLevel} onChangeText={(activityLevel) => setForm((current) => ({ ...current, activityLevel }))} placeholder="Low, moderate, high" />
            <TextField label="Diet preference" value={form.dietPreference} onChangeText={(dietPreference) => setForm((current) => ({ ...current, dietPreference }))} placeholder="Balanced, vegetarian, high protein..." />
            <TextField label="Workout preference" value={form.workoutPreference} onChangeText={(workoutPreference) => setForm((current) => ({ ...current, workoutPreference }))} placeholder="Gym, home, cardio, walking..." />
            <TextField label="Focus statement" value={form.focusStatement} onChangeText={(focusStatement) => setForm((current) => ({ ...current, focusStatement }))} multiline />
            <Button
              title={saved ? 'Saved' : 'Save profile'}
              icon={saved ? 'checkmark' : 'save-outline'}
              onPress={save}
              loading={saving}
              fullWidth
            />
          </View>
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(500)}>
        <Card tone="outlined" padding={20}>
          <View style={{ gap: 10 }}>
            <Typo variant="bodyEmphasis">Session</Typo>
            <Typo variant="body" color={Colors.inkMuted}>
              Sign out on this device. Your Supabase-backed meals, workouts, reflections, and profile stay with your account.
            </Typo>
            <Button title="Log out" icon="log-out-outline" variant="destructive" onPress={logout} />
          </View>
        </Card>
      </Animated.View>
    </Screen>
  );
}
