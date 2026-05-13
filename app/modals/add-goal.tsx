import { useState } from 'react';
import { View, KeyboardAvoidingView, Platform, Pressable, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typo } from '@/components/typography';
import { Button } from '@/components/button';
import { TextField } from '@/components/text-field';
import { Colors, DisplayFont, Radii } from '@/constants/Theme';
import { useAppStore } from '@/store/useAppStore';
import type { AccentColor, GoalCategory, GoalUnit } from '@/store/types';
import { ACCENT_OPTIONS, accentPair } from '@/utils/colors';
import { GOAL_CATEGORY_META } from '@/utils/goals';

const CATEGORIES = Object.keys(GOAL_CATEGORY_META) as GoalCategory[];

export default function AddGoalModal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const addGoal = useAppStore((s) => s.addGoal);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState<AccentColor>('accent');
  const [category, setCategory] = useState<GoalCategory>('nutrition');
  const [unit, setUnit] = useState<GoalUnit>('grams protein');
  const [target, setTarget] = useState('100');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const canSave = title.trim().length > 0 && Number(target) > 0;

  const save = async () => {
    setError('');
    if (!title.trim()) {
      setError('Add a goal name before saving.');
      return;
    }
    if (!(Number(target) > 0)) {
      setError('Add a target greater than zero.');
      return;
    }
    setSaving(true);
    try {
      await addGoal({
        title,
        description: description || undefined,
        color,
        category,
        unit,
        target: Number(target),
      });
      if (router.canGoBack()) router.back(); else router.replace('/(tabs)');
    } catch (saveError) {
      if (__DEV__) console.warn('Goal creation failed', saveError);
      setError('Could not create goal. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const pair = accentPair(color);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, backgroundColor: Colors.bg }}
      >
        <View
          style={{
            flex: 1,
            paddingTop: insets.top + 12,
            paddingBottom: insets.bottom + 20,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: 24,
              marginBottom: 20,
            }}
          >
            <Pressable
              onPress={() => router.back()}
              hitSlop={10}
              accessibilityLabel="Close"
              style={({ pressed }) => ({ padding: 4, opacity: pressed ? 0.6 : 1 })}
            >
              <Ionicons name="close" size={24} color={Colors.ink} />
            </Pressable>
            <Typo variant="eyebrow" color={Colors.inkMuted}>
              New goal
            </Typo>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView
            automaticallyAdjustKeyboardInsets
            keyboardDismissMode="interactive"
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingBottom: 32,
              gap: 20,
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
          <Typo
            style={{
              fontFamily: DisplayFont,
              fontSize: 32,
              lineHeight: 36,
              letterSpacing: -0.8,
              color: Colors.ink,
            }}
          >
            Name a{' '}
            <Typo
              style={{
                fontFamily: DisplayFont,
                fontSize: 32,
                lineHeight: 36,
                letterSpacing: -0.8,
                fontStyle: 'italic',
                color: pair.base,
              }}
            >
              long horizon.
            </Typo>
          </Typo>

          <TextField
            label="The goal"
            placeholder="e.g. Hit protein target"
            value={title}
            onChangeText={setTitle}
            autoFocus
          />

          <TextField
            label="Why it matters"
            placeholder="The reason you&#39;ll return to it…"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <View style={{ gap: 10 }}>
            <Typo variant="label" color={Colors.inkSoft}>
              Category
            </Typo>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {CATEGORIES.map((c) => {
                const active = category === c;
                const meta = GOAL_CATEGORY_META[c];
                return (
                  <Pressable
                    key={c}
                    onPress={() => {
                      setCategory(c);
                      setUnit(meta.units[0]);
                    }}
                    style={({ pressed }) => ({
                      paddingHorizontal: 12,
                      paddingVertical: 9,
                      borderRadius: Radii.pill,
                      backgroundColor: active ? Colors.ink : Colors.surface,
                      borderWidth: 1,
                      borderColor: active ? Colors.ink : Colors.border,
                      opacity: pressed ? 0.8 : 1,
                    })}
                  >
                    <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                      <Ionicons name={meta.icon} size={15} color={active ? '#FBF8F0' : Colors.inkSoft} />
                      <Typo variant="bodyEmphasis" color={active ? '#FBF8F0' : Colors.ink} style={{ fontSize: 13 }}>
                        {meta.label}
                      </Typo>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={{ gap: 10 }}>
            <Typo variant="label" color={Colors.inkSoft}>
              Unit
            </Typo>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {GOAL_CATEGORY_META[category].units.map((u) => {
                const active = unit === u;
                return (
                  <Pressable
                    key={u}
                    onPress={() => setUnit(u)}
                    style={({ pressed }) => ({
                      paddingHorizontal: 12,
                      paddingVertical: 9,
                      borderRadius: Radii.pill,
                      backgroundColor: active ? Colors.ink : Colors.surface,
                      borderWidth: 1,
                      borderColor: active ? Colors.ink : Colors.border,
                      opacity: pressed ? 0.8 : 1,
                    })}
                  >
                    <Typo variant="bodyEmphasis" color={active ? '#FBF8F0' : Colors.ink} style={{ fontSize: 13 }}>
                      {u}
                    </Typo>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <TextField
            label={`Target (${unit})`}
            placeholder="e.g. 100"
            value={target}
            onChangeText={setTarget}
            keyboardType="number-pad"
          />

          <View style={{ gap: 10 }}>
            <Typo variant="label" color={Colors.inkSoft}>
              Color
            </Typo>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {ACCENT_OPTIONS.map((c) => {
                const p = accentPair(c);
                const active = color === c;
                return (
                  <Pressable
                    key={c}
                    onPress={() => setColor(c)}
                    accessibilityLabel={`Color ${c}`}
                    style={({ pressed }) => ({
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: p.base,
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: pressed ? 0.8 : 1,
                      boxShadow: active ? `0 0 0 2px ${Colors.ink}` : 'none',
                    })}
                  />
                );
              })}
            </View>
          </View>
        </ScrollView>

          <View style={{ paddingHorizontal: 24, marginTop: 8 }}>
            {error ? (
              <Typo variant="caption" color={Colors.error} style={{ marginBottom: 8 }}>
                {error}
              </Typo>
            ) : null}
            <Button
              title="Set goal"
              icon="telescope"
              onPress={save}
              disabled={!canSave}
              loading={saving}
              fullWidth
              size="lg"
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
