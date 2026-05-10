import { useState } from 'react';
import { View, KeyboardAvoidingView, Platform, Pressable, TouchableWithoutFeedback, Keyboard, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typo } from '@/components/typography';
import { Button } from '@/components/button';
import { TextField } from '@/components/text-field';
import { Colors, DisplayFont } from '@/constants/Theme';
import { useAppStore } from '@/store/useAppStore';

export default function AddTaskModal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const addTask = useAppStore((s) => s.addTask);

  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');

  const canSave = title.trim().length > 0;

  const save = () => {
    if (!canSave) return;
    addTask({ title, note: note || undefined });
    if (router.canGoBack()) router.back(); else router.replace('/(tabs)');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, backgroundColor: Colors.bg }}
      >
        <ScrollView
          automaticallyAdjustKeyboardInsets
          keyboardDismissMode="interactive"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View
            style={{
              flex: 1,
              paddingTop: insets.top + 12,
              paddingBottom: insets.bottom + 28,
              paddingHorizontal: 24,
              gap: 20,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
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
                New task
              </Typo>
              <View style={{ width: 24 }} />
            </View>

            <View style={{ flex: 1, gap: 20 }}>
              <Typo
                style={{
                  fontFamily: DisplayFont,
                  fontSize: 32,
                  lineHeight: 36,
                  letterSpacing: -0.8,
                  color: Colors.ink,
                }}
              >
                A single,{' '}
                <Typo
                  style={{
                    fontFamily: DisplayFont,
                    fontSize: 32,
                    lineHeight: 36,
                    letterSpacing: -0.8,
                    fontStyle: 'italic',
                    color: Colors.accent,
                  }}
                >
                  honest task.
                </Typo>
              </Typo>

              <TextField
                label="Task"
                placeholder="e.g. Write the first page"
                value={title}
                onChangeText={setTitle}
                autoFocus
                returnKeyType="next"
              />

              <TextField
                label="Note (optional)"
                placeholder="Add a detail…"
                value={note}
                onChangeText={setNote}
                multiline
              />
            </View>

            <Button
              title="Add task"
              icon="add"
              onPress={save}
              disabled={!canSave}
              fullWidth
              size="lg"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
