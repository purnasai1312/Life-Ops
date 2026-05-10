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
import { useAppStore } from '@/store/useAppStore';

const INTENTIONS = [
  { key: 'clarity', label: 'Find clarity', icon: 'compass-outline' },
  { key: 'health', label: 'Feel healthier', icon: 'leaf-outline' },
  { key: 'focus', label: 'Focus deeper', icon: 'flame-outline' },
  { key: 'rest', label: 'Rest well', icon: 'moon-outline' },
  { key: 'create', label: 'Make things', icon: 'color-palette-outline' },
  { key: 'present', label: 'Be present', icon: 'flower-outline' },
] as const;

const GOALS = ['Feel healthier', 'Build consistency', 'Improve energy', 'Lose weight', 'Gain strength'];
const ACTIVITY = ['Light', 'Moderate', 'Active', 'Very active'];
const DIETS = ['Flexible', 'Vegetarian', 'Vegan', 'Mediterranean', 'High protein'];
const HABITS = ['Walk daily', 'Drink water', 'Sleep earlier', 'Journal', 'Stretch', 'Plan meals'];

export default function Onboarding() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAuthenticated, isLoading, user } = useAuth();
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
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
  const [habits, setHabits] = useState<string[]>(preferences.habits ?? []);
  const [intentions, setIntentions] = useState<string[]>(preferences.intentions ?? []);
  const [focusStatement, setFocusStatement] = useState(preferences.focusStatement ?? '');
  const [saving, setSaving] = useState(false);

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
      } catch {
        // Onboarding can continue locally if remote profile creation is unavailable.
      }
    };
    initializeProfile();
  }, [metadataName, preferences.hasCompletedOnboarding, user?.id]);

  const onboardedForThisUser =
    preferences.hasCompletedOnboarding &&
    (!user?.id || !preferences.userId || preferences.userId === user.id);

  if (onboardedForThisUser) {
    return <Redirect href="/(tabs)" />;
  }

  if (!isLoading && !isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  const totalSteps = 6;
  const canNext = Boolean(
    (step === 0 && name.trim().length > 0) ||
    (step === 1 && age.trim() && height.trim() && weight.trim()) ||
    (step === 2 && goal && activityLevel) ||
    (step === 3 && dietPreference && habits.length > 0) ||
    (step === 4 && intentions.length > 0) ||
    (step === 5 && focusStatement.trim().length > 0)
  );

  const toggle = (value: string, setter: (next: string[]) => void, current: string[]) => {
    setter(current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  };

  const saveProfileToSupabase = async () => {
    if (!user?.id) return;
    const profile = {
      id: user.id,
      name: name.trim(),
      age: Number(age) || null,
      height: height.trim(),
      weight: weight.trim(),
      goal,
      activity_level: activityLevel,
      diet_preference: dietPreference,
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
  };

  const next = async () => {
    if (!canNext || saving) return;
    if (step < totalSteps - 1) {
      setStep((current) => current + 1);
      return;
    }

    setSaving(true);
    completeOnboarding({
      userId: user?.id,
      name,
      age,
      height,
      weight,
      goal,
      activityLevel,
      dietPreference,
      habits,
      intentions,
      focusStatement,
    });
    try {
      await saveProfileToSupabase();
    } catch {
      // Local onboarding is still persisted; remote profile can sync later.
    } finally {
      setSaving(false);
      router.replace('/(tabs)');
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
                    <Title eyebrow="Routines" title="Food and habits," accent="gently." />
                    <Typo variant="eyebrow" color={Colors.inkMuted}>Diet preference</Typo>
                    <OptionGrid options={DIETS} selected={[dietPreference]} onPress={setDietPreference} />
                    <Typo variant="eyebrow" color={Colors.inkMuted}>Habits to build</Typo>
                    <OptionGrid
                      options={HABITS}
                      selected={habits}
                      onPress={(value) => toggle(value, setHabits, habits)}
                    />
                  </>
                ) : null}

                {step === 4 ? (
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

                {step === 5 ? (
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
      {icon ? <Ionicons name={icon} size={16} color={active ? Colors.bgElevated : Colors.inkSoft} /> : null}
      <Typo variant="bodyEmphasis" color={active ? Colors.bgElevated : Colors.ink} style={{ fontSize: 14 }}>
        {label}
      </Typo>
    </Pressable>
  );
}
