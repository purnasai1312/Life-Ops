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
import type { AccentColor } from '@/store/types';
import { ACCENT_OPTIONS, accentPair } from '@/utils/colors';

const TARGETS = [5, 10, 20, 30, 50, 100];

export default function AddGoalModal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const addGoal = useAppStore((s) => s.addGoal);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState<AccentColor>('accent');
  const [target, setTarget] = useState<number>(10);

  const canSave = title.trim().length > 0 && target > 0;

  const save = () => {
    if (!canSave) return;
    addGoal({
      title,
      description: description || undefined,
      color,
      target,
    });
    if (router.canGoBack()) router.back(); else router.replace('/(tabs)');
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
            placeholder="e.g. Finish the manuscript"
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
              Target ({target} steps)
            </Typo>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {TARGETS.map((t) => {
                const active = target === t;
                return (
                  <Pressable
                    key={t}
                    onPress={() => setTarget(t)}
                    style={({ pressed }) => ({
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      borderRadius: Radii.pill,
                      backgroundColor: active ? Colors.ink : Colors.surface,
                      borderWidth: 1,
                      borderColor: active ? Colors.ink : Colors.border,
                      opacity: pressed ? 0.8 : 1,
                    })}
                  >
                    <Typo
                      variant="bodyEmphasis"
                      color={active ? '#FBF8F0' : Colors.ink}
                    >
                      {t}
                    </Typo>
                  </Pressable>
                );
              })}
            </View>
          </View>

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
            <Button
              title="Set goal"
              icon="telescope"
              onPress={save}
              disabled={!canSave}
              fullWidth
              size="lg"
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
