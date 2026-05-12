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
import type { AccentColor, HabitCadence } from '@/store/types';
import { ACCENT_OPTIONS, accentPair } from '@/utils/colors';

const ICONS: (keyof typeof Ionicons.glyphMap)[] = [
  'leaf-outline',
  'walk-outline',
  'journal-outline',
  'book-outline',
  'water-outline',
  'moon-outline',
  'flame-outline',
  'bicycle-outline',
  'flower-outline',
  'musical-notes-outline',
  'heart-outline',
  'bulb-outline',
];

const CADENCES: { key: HabitCadence; label: string }[] = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekdays', label: 'Weekdays' },
  { key: 'weekly', label: 'Weekly' },
];

export default function AddHabitModal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const addHabit = useAppStore((s) => s.addHabit);

  const [title, setTitle] = useState('');
  const [icon, setIcon] = useState<keyof typeof Ionicons.glyphMap>('leaf-outline');
  const [color, setColor] = useState<AccentColor>('forest');
  const [cadence, setCadence] = useState<HabitCadence>('daily');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const canSave = title.trim().length > 0;

  const save = async () => {
    if (!canSave || saving) return;
    setSaving(true);
    setError('');
    try {
      await addHabit({ title, icon, color, cadence });
      if (router.canGoBack()) router.back(); else router.replace('/(tabs)');
    } catch (saveError) {
      setError((saveError as Error).message || 'Could not create habit. Please try again.');
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
              New habit
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
            Plant a{' '}
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
              new ritual.
            </Typo>
          </Typo>

          <TextField
            label="What will you do?"
            placeholder="e.g. Ten minutes of stillness"
            value={title}
            onChangeText={setTitle}
            autoFocus
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
                      borderWidth: active ? 3 : 0,
                      borderColor: Colors.bg,
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

          <View style={{ gap: 10 }}>
            <Typo variant="label" color={Colors.inkSoft}>
              Icon
            </Typo>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {ICONS.map((i) => {
                const active = icon === i;
                return (
                  <Pressable
                    key={i}
                    onPress={() => setIcon(i)}
                    accessibilityLabel={`Icon ${i}`}
                    style={({ pressed }) => ({
                      width: 50,
                      height: 50,
                      borderRadius: Radii.md,
                      backgroundColor: active ? pair.soft : Colors.surface,
                      borderWidth: 1,
                      borderColor: active ? pair.base : Colors.border,
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: pressed ? 0.8 : 1,
                      borderCurve: 'continuous',
                    })}
                  >
                    <Ionicons
                      name={i}
                      size={22}
                      color={active ? pair.ink : Colors.inkSoft}
                    />
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={{ gap: 10 }}>
            <Typo variant="label" color={Colors.inkSoft}>
              Cadence
            </Typo>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {CADENCES.map((c) => {
                const active = cadence === c.key;
                return (
                  <Pressable
                    key={c.key}
                    onPress={() => setCadence(c.key)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    style={({ pressed }) => ({
                      flex: 1,
                      paddingVertical: 14,
                      borderRadius: Radii.md,
                      backgroundColor: active ? Colors.ink : Colors.surface,
                      borderWidth: 1,
                      borderColor: active ? Colors.ink : Colors.border,
                      alignItems: 'center',
                      opacity: pressed ? 0.8 : 1,
                      borderCurve: 'continuous',
                    })}
                  >
                    <Typo
                      variant="bodyEmphasis"
                      color={active ? '#FBF8F0' : Colors.ink}
                    >
                      {c.label}
                    </Typo>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </ScrollView>

          <View style={{ paddingHorizontal: 24, marginTop: 8 }}>
            {error ? (
              <Typo variant="caption" color={Colors.error} style={{ marginBottom: 10 }}>
                {error}
              </Typo>
            ) : null}
            <Button
              title="Create habit"
              icon="leaf"
              onPress={save}
              disabled={!canSave || saving}
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
