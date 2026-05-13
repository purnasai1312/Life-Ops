import { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';
import { useRouter } from 'expo-router';
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
  const router = useRouter();
  const { signOut, user, developerResetSession } = useAuth();
  const preferences = useAppStore((s) => s.preferences);
  const loadProfile = useAppStore((s) => s.loadProfile);
  const saveProfile = useAppStore((s) => s.saveProfile);
  const resetAll = useAppStore((s) => s.resetAll);
  const resetOnboardingForTesting = useAppStore((s) => s.resetOnboardingForTesting);

  const [form, setForm] = useState({
    name: preferences.name,
    age: preferences.age ?? '',
    height: preferences.height ?? '',
    weight: preferences.weight ?? '',
    goal: preferences.goal ?? '',
    activityLevel: preferences.activityLevel ?? '',
    dietPreference: preferences.dietPreference ?? '',
    workoutPreferences: (preferences.workoutPreferences ?? (preferences.workoutPreference ? [preferences.workoutPreference] : [])).join(', '),
    experienceLevel: preferences.experienceLevel ?? '',
    calorieTarget: preferences.calorieTarget ?? '',
    proteinTarget: preferences.proteinTarget ?? '',
    waterTarget: preferences.waterTarget ?? '',
    workoutFrequencyGoal: preferences.workoutFrequencyGoal ?? '',
    movementGoal: preferences.movementGoal ?? '',
    focusStatement: preferences.focusStatement,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [busyAction, setBusyAction] = useState<'logout' | 'reset' | 'clear' | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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
      workoutPreferences: (preferences.workoutPreferences ?? (preferences.workoutPreference ? [preferences.workoutPreference] : [])).join(', '),
      experienceLevel: preferences.experienceLevel ?? '',
      calorieTarget: preferences.calorieTarget ?? '',
      proteinTarget: preferences.proteinTarget ?? '',
      waterTarget: preferences.waterTarget ?? '',
      workoutFrequencyGoal: preferences.workoutFrequencyGoal ?? '',
      movementGoal: preferences.movementGoal ?? '',
      focusStatement: preferences.focusStatement,
    });
  }, [preferences]);

  const save = async () => {
    setFeedback(null);
    if (!form.name.trim()) {
      setFeedback({ type: 'error', message: 'Add your name before saving.' });
      return;
    }
    setSaving(true);
    setSaved(false);
    try {
      await saveProfile({
        ...form,
        workoutPreference: form.workoutPreferences.split(',').map((item) => item.trim()).filter(Boolean)[0] ?? '',
        workoutPreferences: form.workoutPreferences.split(',').map((item) => item.trim()).filter(Boolean),
      });
      setSaved(true);
      setFeedback({ type: 'success', message: 'Profile saved.' });
      setTimeout(() => setSaved(false), 1600);
    } catch (error) {
      if (__DEV__) console.warn('Profile save failed', error);
      setFeedback({ type: 'error', message: 'Could not save profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const logout = async () => {
    Alert.alert('Log out?', 'You can sign back in anytime.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          setBusyAction('logout');
          try {
            await signOut();
            resetAll();
            router.replace('/(auth)/login');
          } catch (error) {
            if (__DEV__) console.warn('Logout failed', error);
            setFeedback({ type: 'error', message: 'Could not log out. Please try again.' });
          } finally {
            setBusyAction(null);
          }
        },
      },
    ]);
  };

  const resetFlow = async () => {
    setBusyAction('reset');
    try {
      await resetOnboardingForTesting();
      await signOut();
      resetAll();
      router.replace('/(auth)/login');
    } catch (error) {
      if (__DEV__) console.warn('Reset flow failed', error);
      setFeedback({ type: 'error', message: 'Could not reset onboarding. Please try again.' });
    } finally {
      setBusyAction(null);
    }
  };

  const developerReset = async () => {
    setBusyAction('clear');
    try {
      await developerResetSession();
      resetAll();
      router.replace('/(auth)/login');
    } catch (error) {
      if (__DEV__) console.warn('Local session clear failed', error);
      setFeedback({ type: 'error', message: 'Could not clear local session. Please try again.' });
    } finally {
      setBusyAction(null);
    }
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
                {user?.email ?? 'Signed in'}
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
            <TextField label="Workout preferences" value={form.workoutPreferences} onChangeText={(workoutPreferences) => setForm((current) => ({ ...current, workoutPreferences }))} placeholder="Gym, home, walking, running..." />
            <TextField label="Experience level" value={form.experienceLevel} onChangeText={(experienceLevel) => setForm((current) => ({ ...current, experienceLevel }))} placeholder="Beginner, intermediate, advanced" />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <TextField label="Calories" value={form.calorieTarget} onChangeText={(calorieTarget) => setForm((current) => ({ ...current, calorieTarget }))} keyboardType="numeric" />
              </View>
              <View style={{ flex: 1 }}>
                <TextField label="Protein" value={form.proteinTarget} onChangeText={(proteinTarget) => setForm((current) => ({ ...current, proteinTarget }))} keyboardType="numeric" />
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <TextField label="Water oz" value={form.waterTarget} onChangeText={(waterTarget) => setForm((current) => ({ ...current, waterTarget }))} keyboardType="numeric" />
              </View>
              <View style={{ flex: 1 }}>
                <TextField label="Workouts/wk" value={form.workoutFrequencyGoal} onChangeText={(workoutFrequencyGoal) => setForm((current) => ({ ...current, workoutFrequencyGoal }))} keyboardType="numeric" />
              </View>
            </View>
            <TextField label="Movement goal" value={form.movementGoal} onChangeText={(movementGoal) => setForm((current) => ({ ...current, movementGoal }))} keyboardType="numeric" />
            <TextField label="Focus statement" value={form.focusStatement} onChangeText={(focusStatement) => setForm((current) => ({ ...current, focusStatement }))} multiline />
            <Button
              title={saved ? 'Saved' : 'Save profile'}
              icon={saved ? 'checkmark' : 'save-outline'}
              onPress={save}
              loading={saving}
              disabled={!form.name.trim()}
              fullWidth
            />
            {feedback ? (
              <Typo variant="caption" color={feedback.type === 'error' ? Colors.error : Colors.forest}>
                {feedback.message}
              </Typo>
            ) : null}
          </View>
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(500)}>
        <Card tone="outlined" padding={20}>
          <View style={{ gap: 10 }}>
            <Typo variant="bodyEmphasis">Session</Typo>
            <Typo variant="body" color={Colors.inkMuted}>
              Sign out on this device. Your meals, workouts, reflections, and profile stay with your account.
            </Typo>
            <Button title="Log out" icon="log-out-outline" variant="destructive" onPress={logout} loading={busyAction === 'logout'} />
            {__DEV__ ? (
              <>
                <Button title="Reset onboarding" icon="refresh-outline" variant="secondary" onPress={resetFlow} loading={busyAction === 'reset'} />
                <Button title="Clear local session" icon="trash-outline" variant="secondary" onPress={developerReset} loading={busyAction === 'clear'} />
              </>
            ) : null}
          </View>
        </Card>
      </Animated.View>
    </Screen>
  );
}
