import { useEffect, useMemo, useState } from 'react';
import type React from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut, SlideInRight } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { ProgressBar } from '@/components/progress-bar';
import { TextField } from '@/components/text-field';
import { Typo } from '@/components/typography';
import { Colors, DisplayFont, Radii } from '@/constants/Theme';
import { isMissingSupabaseTableError, supabase } from '@/lib/supabase';
import { getDefaultTargets, useAppStore } from '@/store/useAppStore';
import { getSuggestedGoalTemplates } from '@/utils/goals';

const INTENTIONS = [
  { key: 'clarity', label: 'Find clarity', icon: 'compass-outline' },
  { key: 'health', label: 'Feel healthier', icon: 'leaf-outline' },
  { key: 'focus', label: 'Focus deeper', icon: 'flame-outline' },
  { key: 'rest', label: 'Rest well', icon: 'moon-outline' },
  { key: 'create', label: 'Make things', icon: 'color-palette-outline' },
  { key: 'present', label: 'Be present', icon: 'flower-outline' },
] as const;

const GOALS = ['Lose weight', 'Gain muscle', 'Maintain', 'Feel healthier'];
const ACTIVITY = ['Light', 'Moderate', 'Active', 'Very active'];
const DIETS = ['Omnivore', 'Vegetarian', 'Vegan', 'Pescatarian', 'No preference'];
const WORKOUTS = ['Gym', 'Home', 'Walking', 'Running', 'Yoga/mobility', 'Mixed'];
const EXPERIENCE = ['Beginner', 'Intermediate', 'Advanced'];
const HABITS = ['Walk daily', 'Drink water', 'Sleep earlier', 'Journal', 'Stretch', 'Plan meals', 'Protein each meal', 'Prep tomorrow'];

export default function Onboarding() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAuthenticated, isLoading, user } = useAuth();
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const addGoalTemplates = useAppStore((s) => s.addGoalTemplates);
  const preferences = useAppStore((s) => s.preferences);

  const metadataName = useMemo(() => {
    const meta = (user as any)?.user_metadata ?? {};
    return meta.full_name || meta.name || meta.preferred_username || '';
  }, [user]);

  const [step, setStep] = useState(0);
  const [name, setName] = useState(metadataName);
  const [age, setAge] = useState(preferences.age ?? '');
  const [height, setHeight] = useState(preferences.height ?? '');
  const [weight, setWeight] = useState(preferences.weight ?? '');
  const [goal, setGoal] = useState(preferences.goal ?? '');
  const [activityLevel, setActivityLevel] = useState(preferences.activityLevel ?? '');
  const [dietPreference, setDietPreference] = useState(preferences.dietPreference ?? '');
  const [workoutPreferences, setWorkoutPreferences] = useState<string[]>(
    preferences.workoutPreferences ?? (preferences.workoutPreference ? [preferences.workoutPreference] : [])
  );
  const [experienceLevel, setExperienceLevel] = useState(preferences.experienceLevel ?? '');
  const [calorieTarget, setCalorieTarget] = useState(preferences.calorieTarget ?? '');
  const [proteinTarget, setProteinTarget] = useState(preferences.proteinTarget ?? '');
  const [waterTarget, setWaterTarget] = useState(preferences.waterTarget ?? '');
  const [workoutFrequencyGoal, setWorkoutFrequencyGoal] = useState(preferences.workoutFrequencyGoal ?? '');
  const [movementGoal, setMovementGoal] = useState(preferences.movementGoal ?? '');
  const [habits, setHabits] = useState<string[]>(preferences.habits ?? []);
  const [habitPriorities, setHabitPriorities] = useState<string[]>(preferences.habitPriorities ?? preferences.habits ?? []);
  const [selectedGoals, setSelectedGoals] = useState<string[]>(preferences.selectedGoals ?? []);
  const [intentions, setIntentions] = useState<string[]>(preferences.intentions ?? []);
  const [focusStatement, setFocusStatement] = useState(preferences.focusStatement ?? '');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (!name && metadataName) setName(metadataName);
  }, [metadataName, name]);

  useEffect(() => {
    if (!user?.id || preferences.hasCompletedOnboarding) return;
    const initializeProfile = async () => {
      try {
        const { error } = await supabase.from('profiles').upsert({
          id: user.id,
          name: metadataName || null,
          has_completed_onboarding: false,
          updated_at: new Date().toISOString(),
        });
        if (error) throw error;
      } catch (error) {
        if (__DEV__) {
          console.info('[Onboarding] initial profile upsert failed:', (error as Error).message);
        }
      }
    };
    initializeProfile();
  }, [metadataName, preferences.hasCompletedOnboarding, user?.id]);

  useEffect(() => {
    const defaults = getDefaultTargets({ weight, goal, activityLevel });
    if (!calorieTarget) setCalorieTarget(defaults.calorieTarget);
    if (!proteinTarget) setProteinTarget(defaults.proteinTarget);
    if (!waterTarget) setWaterTarget(defaults.waterTarget);
    if (!workoutFrequencyGoal) setWorkoutFrequencyGoal(defaults.workoutFrequencyGoal);
    if (!movementGoal) setMovementGoal(defaults.movementGoal);
  }, [activityLevel, calorieTarget, goal, movementGoal, proteinTarget, waterTarget, weight, workoutFrequencyGoal]);

  const onboardedForThisUser =
    preferences.hasCompletedOnboarding &&
    Boolean(user?.id) &&
    preferences.userId === user?.id &&
    Boolean(preferences.name?.trim()) &&
    Boolean(preferences.goal) &&
    Boolean(preferences.workoutPreferences?.length || preferences.workoutPreference) &&
    Boolean(preferences.experienceLevel) &&
    Boolean(preferences.calorieTarget) &&
    Boolean(preferences.proteinTarget);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <Typo variant="eyebrow" color={Colors.inkMuted}>
          Checking session
        </Typo>
      </View>
    );
  }

  if (!isAuthenticated || !user?.id) {
    return <Redirect href="/(auth)/login" />;
  }

  if (onboardedForThisUser) {
    return <Redirect href="/(tabs)" />;
  }

  const totalSteps = 9;
  const canNext = Boolean(
    (step === 0 && name.trim().length > 0) ||
    (step === 1 && age.trim() && height.trim() && weight.trim()) ||
    (step === 2 && goal && activityLevel) ||
    (step === 3 && dietPreference && workoutPreferences.length > 0 && experienceLevel) ||
    (step === 4 && calorieTarget && proteinTarget && waterTarget && workoutFrequencyGoal && movementGoal) ||
    (step === 5 && selectedGoals.length > 0) ||
    (step === 6 && habitPriorities.length > 0) ||
    (step === 7 && intentions.length > 0) ||
    (step === 8 && focusStatement.trim().length > 0)
  );

  const toggle = (value: string, setter: (next: string[]) => void, current: string[]) => {
    setter(current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  };

  const saveProfileToSupabase = async () => {
    if (!user?.id) throw new Error('You need to be signed in to finish onboarding.');
    const profile = {
      id: user.id,
      name: name.trim(),
      age: Number(age) || null,
      height: height.trim(),
      weight: weight.trim(),
      goal,
      activity_level: activityLevel,
      diet_preference: dietPreference,
      workout_preference: workoutPreferences[0] ?? null,
      workout_preferences: workoutPreferences,
      experience_level: experienceLevel,
      calorie_target: Number(calorieTarget) || null,
      protein_target: Number(proteinTarget) || null,
      water_target: Number(waterTarget) || null,
      workout_frequency_goal: Number(workoutFrequencyGoal) || null,
      movement_goal: Number(movementGoal) || null,
      habit_priorities: habitPriorities,
      selected_goals: selectedGoals,
      habits,
      intentions,
      focus_statement: focusStatement.trim(),
      has_completed_onboarding: true,
      updated_at: new Date().toISOString(),
    };
    const onboarding = {
      user_id: user.id,
      age: Number(age) || null,
      height: height.trim(),
      weight: weight.trim(),
      goal,
      activity_level: activityLevel,
      diet_preference: dietPreference,
      workout_preference: workoutPreferences[0] ?? null,
      workout_preferences: workoutPreferences,
      experience_level: experienceLevel,
      calorie_target: Number(calorieTarget) || null,
      protein_target: Number(proteinTarget) || null,
      water_target: Number(waterTarget) || null,
      workout_frequency_goal: Number(workoutFrequencyGoal) || null,
      movement_goal: Number(movementGoal) || null,
      habit_priorities: habitPriorities,
      selected_goals: selectedGoals,
      habits,
      intentions,
      focus_statement: focusStatement.trim(),
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error: profileError } = await supabase.from('profiles').upsert(profile);
    if (profileError) throw profileError;

    const { error: onboardingError } = await supabase
      .from('onboarding')
      .upsert(onboarding, { onConflict: 'user_id' });
    if (onboardingError && !isMissingSupabaseTableError(onboardingError)) {
      throw onboardingError;
    }

    if (__DEV__) {
      console.info('[Onboarding] saved onboarding_complete value:', true, 'user id:', user.id);
    }
  };

  const next = async () => {
    if (!canNext || saving) return;
    if (step < totalSteps - 1) {
      setStep((current) => current + 1);
      return;
    }

    setSaving(true);
    setSaveError('');
    try {
      await saveProfileToSupabase();
      completeOnboarding({
        userId: user.id,
        name,
        age,
        height,
        weight,
        goal,
        activityLevel,
        dietPreference,
        workoutPreference: workoutPreferences[0] ?? '',
        workoutPreferences,
        experienceLevel,
        calorieTarget,
        proteinTarget,
        waterTarget,
        workoutFrequencyGoal,
        movementGoal,
        habitPriorities,
        selectedGoals,
        habits,
        intentions,
        focusStatement,
      });
      const templates = getSuggestedGoalTemplates({
        goal,
        proteinTarget,
        calorieTarget,
        waterTarget,
        movementGoal,
        workoutFrequencyGoal,
      }).filter((template) => selectedGoals.includes(template.key));
      await addGoalTemplates(templates).catch((error) => {
        if (__DEV__) {
          console.info('[Onboarding] goal template creation failed:', (error as Error).message);
        }
      });
      router.replace('/(tabs)');
    } catch (error) {
      const message = (error as Error).message || 'Onboarding could not be saved. Please try again.';
      setSaveError(message);
      if (__DEV__) {
        console.info('[Onboarding] completion save failed:', message);
      }
    } finally {
      setSaving(false);
    }
  };

  const back = () => {
    if (step > 0) setStep((current) => current - 1);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, backgroundColor: Colors.bg }}
      >
        <ScrollView
          alwaysBounceVertical
          automaticallyAdjustKeyboardInsets
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            paddingTop: insets.top + 12,
            paddingBottom: insets.bottom + 28,
            paddingHorizontal: 22,
          }}
        >
          <View style={{ flex: 1, gap: 22 }}>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <Pressable
                hitSlop={12}
                onPress={back}
                disabled={step === 0}
                style={{ opacity: step === 0 ? 0 : 1, padding: 8, marginLeft: -8 }}
              >
                <Ionicons name="arrow-back" size={20} color={Colors.ink} />
              </Pressable>
              <View style={{ flex: 1 }}>
                <ProgressBar progress={(step + 1) / totalSteps} height={5} color={Colors.ink} />
              </View>
              <Typo variant="label" color={Colors.inkMuted}>
                {step + 1}/{totalSteps}
              </Typo>
            </View>

            <View style={{ flex: 1, justifyContent: 'space-between', gap: 28 }}>
              <Step keyName={`step-${step}`}>
                {step === 0 ? (
                  <>
                    <Title eyebrow="Welcome" title="Let's begin with" accent="your name." />
                    <Typo variant="body">We use this to make LifeOps feel personal without getting noisy.</Typo>
                    <TextField
                      label="Your name"
                      placeholder="e.g. Juno"
                      value={name}
                      onChangeText={setName}
                      autoFocus
                      autoCapitalize="words"
                      returnKeyType="next"
                      onSubmitEditing={next}
                    />
                  </>
                ) : null}

                {step === 1 ? (
                  <>
                    <Title eyebrow="Basics" title="A quick health" accent="baseline." />
                    <Typo variant="body">Keep it simple. You can refine these later.</Typo>
                    <View style={{ gap: 12 }}>
                      <TextField label="Age" placeholder="32" value={age} onChangeText={setAge} keyboardType="number-pad" />
                      <TextField label="Height" placeholder="5'8&quot; or 173 cm" value={height} onChangeText={setHeight} />
                      <TextField label="Weight" placeholder="165 lb or 75 kg" value={weight} onChangeText={setWeight} />
                    </View>
                  </>
                ) : null}

                {step === 2 ? (
                  <>
                    <Title eyebrow="Direction" title="What are you" accent="working toward?" />
                    <OptionGrid options={GOALS} selected={[goal]} onPress={setGoal} />
                    <Typo variant="eyebrow" color={Colors.inkMuted}>Activity level</Typo>
                    <OptionGrid options={ACTIVITY} selected={[activityLevel]} onPress={setActivityLevel} />
                  </>
                ) : null}

                {step === 3 ? (
                  <>
                    <Title eyebrow="Preferences" title="Food and movement," accent="your way." />
                    <Typo variant="eyebrow" color={Colors.inkMuted}>Diet preference</Typo>
                    <OptionGrid options={DIETS} selected={[dietPreference]} onPress={setDietPreference} />
                    <Typo variant="eyebrow" color={Colors.inkMuted}>Workout preferences</Typo>
                    <OptionGrid
                      options={WORKOUTS}
                      selected={workoutPreferences}
                      onPress={(value) => toggle(value, setWorkoutPreferences, workoutPreferences)}
                    />
                    <Typo variant="eyebrow" color={Colors.inkMuted}>Experience level</Typo>
                    <OptionGrid options={EXPERIENCE} selected={[experienceLevel]} onPress={setExperienceLevel} />
                  </>
                ) : null}

                {step === 4 ? (
                  <>
                    <Title eyebrow="Targets" title="Set the daily" accent="numbers." />
                    <Typo variant="body">We calculated defaults from your profile. Adjust anything you already know.</Typo>
                    <View style={{ gap: 12 }}>
                      <TextField label="Daily calorie target" value={calorieTarget} onChangeText={setCalorieTarget} keyboardType="number-pad" />
                      <TextField label="Protein target (grams)" value={proteinTarget} onChangeText={setProteinTarget} keyboardType="number-pad" />
                      <TextField label="Water target (oz)" value={waterTarget} onChangeText={setWaterTarget} keyboardType="number-pad" />
                      <TextField label="Workouts per week" value={workoutFrequencyGoal} onChangeText={setWorkoutFrequencyGoal} keyboardType="number-pad" />
                      <TextField label="Daily step / movement goal" value={movementGoal} onChangeText={setMovementGoal} keyboardType="number-pad" />
                    </View>
                  </>
                ) : null}

                {step === 5 ? (
                  <>
                    <Title eyebrow="Goals" title="Choose the goals" accent="to enable." />
                    <Typo variant="body">These create your first real goal records. You can add or remove them later.</Typo>
                    <View style={{ gap: 10 }}>
                      {getSuggestedGoalTemplates({
                        goal,
                        proteinTarget,
                        calorieTarget,
                        waterTarget,
                        movementGoal,
                        workoutFrequencyGoal,
                      }).map((template) => {
                        const active = selectedGoals.includes(template.key);
                        return (
                          <Pill
                            key={template.key}
                            label={`${template.title} · ${template.target} ${template.unit}`}
                            icon="checkmark-circle-outline"
                            active={active}
                            onPress={() => toggle(template.key, setSelectedGoals, selectedGoals)}
                          />
                        );
                      })}
                    </View>
                  </>
                ) : null}

                {step === 6 ? (
                  <>
                    <Title eyebrow="Priorities" title="Pick the habits" accent="to tend." />
                    <Typo variant="body">These shape reminders, empty states, and quick prompts.</Typo>
                    <OptionGrid
                      options={HABITS}
                      selected={habitPriorities}
                      onPress={(value) => {
                        toggle(value, setHabitPriorities, habitPriorities);
                        if (!habits.includes(value)) setHabits((current) => [...current, value]);
                      }}
                    />
                  </>
                ) : null}

                {step === 7 ? (
                  <>
                    <Title eyebrow="Intention" title="What do you want" accent="more of?" />
                    <Typo variant="body">Choose a few. This shapes your empty states and daily prompts.</Typo>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                      {INTENTIONS.map((intention) => {
                        const active = intentions.includes(intention.key);
                        return (
                          <Pill
                            key={intention.key}
                            label={intention.label}
                            icon={intention.icon}
                            active={active}
                            onPress={() => toggle(intention.key, setIntentions, intentions)}
                          />
                        );
                      })}
                    </View>
                  </>
                ) : null}

                {step === 8 ? (
                  <>
                    <Title eyebrow="Compass" title="One sentence to" accent="guide the season." />
                    <Typo variant="body">A quiet north star for your dashboard and daily reset.</Typo>
                    <Card tone="muted" padding={16} radius="lg">
                      <Typo variant="body" italic color={Colors.inkSoft}>
                        &ldquo;Move slower, build deeper, love harder.&rdquo;
                      </Typo>
                    </Card>
                    <TextField
                      label="Your focus statement"
                      placeholder="Write a single line..."
                      value={focusStatement}
                      onChangeText={setFocusStatement}
                      multiline
                      autoFocus
                    />
                  </>
                ) : null}
              </Step>

              <Animated.View entering={FadeIn.duration(250)}>
                {saveError ? (
                  <Typo variant="caption" color={Colors.error} style={{ marginBottom: 10 }}>
                    {saveError}
                  </Typo>
                ) : null}
                <Button
                  title={step === totalSteps - 1 ? 'Begin' : 'Continue'}
                  iconRight={step === totalSteps - 1 ? 'sparkles' : 'arrow-forward'}
                  onPress={next}
                  disabled={!canNext || saving}
                  loading={saving}
                  fullWidth
                  size="lg"
                />
              </Animated.View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

function Step({ children, keyName }: { children: React.ReactNode; keyName: string }) {
  return (
    <Animated.View
      key={keyName}
      entering={SlideInRight.duration(320)}
      exiting={FadeOut.duration(160)}
      style={{ gap: 18 }}
    >
      {children}
    </Animated.View>
  );
}

function Title({ eyebrow, title, accent }: { eyebrow: string; title: string; accent: string }) {
  return (
    <View style={{ gap: 8 }}>
      <Typo variant="eyebrow" color={Colors.accent}>{eyebrow}</Typo>
      <Typo
        style={{
          fontFamily: DisplayFont,
          fontSize: 38,
          lineHeight: 43,
          color: Colors.ink,
        }}
      >
        {title}{'\n'}
        <Typo
          style={{
            fontFamily: DisplayFont,
            fontSize: 38,
            lineHeight: 43,
            fontStyle: 'italic',
            color: Colors.accent,
          }}
        >
          {accent}
        </Typo>
      </Typo>
    </View>
  );
}

function OptionGrid({
  options,
  selected,
  onPress,
}: {
  options: string[];
  selected: string[];
  onPress: (value: string) => void;
}) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
      {options.map((option) => (
        <Pill
          key={option}
          label={option}
          active={selected.includes(option)}
          onPress={() => onPress(option)}
        />
      ))}
    </View>
  );
}

function Pill({
  label,
  active,
  onPress,
  icon,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={({ pressed }) => ({
        minHeight: 44,
        paddingHorizontal: 15,
        paddingVertical: 11,
        borderRadius: Radii.pill,
        backgroundColor: active ? Colors.ink : Colors.surface,
        borderWidth: 1,
        borderColor: active ? Colors.ink : Colors.border,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        opacity: pressed ? 0.75 : 1,
      })}
    >
      <Ionicons
        name={active ? 'checkmark-circle-outline' : icon ?? 'ellipse-outline'}
        size={16}
        color={active ? Colors.bgElevated : Colors.inkSoft}
      />
      <Typo variant="bodyEmphasis" color={active ? Colors.bgElevated : Colors.ink} style={{ fontSize: 14 }}>
        {label}
      </Typo>
    </Pressable>
  );
}
