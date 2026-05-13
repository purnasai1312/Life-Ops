import { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Screen } from '@/components/screen';
import { Typo } from '@/components/typography';
import { Card } from '@/components/card';
import { Button } from '@/components/button';
import { TextField } from '@/components/text-field';
import { Colors, DisplayFont, Radii } from '@/constants/Theme';
import { useAppStore, getTodayISO } from '@/store/useAppStore';
import type { MoodValue } from '@/store/types';
import { lastNDates, formatShortDate, dayLetter } from '@/utils/date';

const MOODS: {
  value: MoodValue;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  background: string;
}[] = [
  { value: 1, label: 'Heavy',    icon: 'rainy-outline',         color: '#4A3F4E', background: '#E4D5DE' },
  { value: 2, label: 'Low',      icon: 'cloud-outline',         color: '#3B6E8F', background: '#D5E2EC' },
  { value: 3, label: 'Steady',   icon: 'partly-sunny-outline',  color: '#7A6432', background: '#F2E5B8' },
  { value: 4, label: 'Bright',   icon: 'sunny-outline',         color: '#C8531F', background: '#F2D9C9' },
  { value: 5, label: 'Radiant',  icon: 'flame-outline',         color: '#2F5D3A', background: '#D4E1D4' },
];

export default function ReflectScreen() {
  const preferences = useAppStore((s) => s.preferences);
  const moods = useAppStore((s) => s.moods);
  const logMood = useAppStore((s) => s.logMood);
  const loadReflections = useAppStore((s) => s.loadReflections);

  const today = getTodayISO();
  const todayMood = useMemo(() => moods.find((m) => m.date === today), [moods, today]);

  const [value, setValue] = useState<MoodValue | null>(todayMood?.value ?? null);
  const [note, setNote] = useState(todayMood?.note ?? '');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [range, setRange] = useState<'today' | '7' | '30'>('7');

  useEffect(() => {
    loadReflections().catch(() => {});
  }, [loadReflections]);

  const submit = useCallback(async () => {
    setError('');
    if (value == null) {
      setError('Choose how you feel before saving.');
      return;
    }
    setSaving(true);
    try {
      await logMood(value, note);
      setSaved(true);
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
      setTimeout(() => setSaved(false), 2000);
    } catch (saveError) {
      if (__DEV__) console.warn('Reflection save failed', saveError);
      setError('Could not save your check-in. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [logMood, note, value]);

  const week = useMemo(() => lastNDates(7), []);
  const moodByDate = useMemo(() => {
    const map: Record<string, { value: MoodValue; note?: string }> = {};
    for (const m of moods) map[m.date] = { value: m.value, note: m.note };
    return map;
  }, [moods]);

  const historyDates = useMemo(
    () => (range === 'today' ? [today] : lastNDates(range === '7' ? 7 : 30)),
    [range, today]
  );
  const history = useMemo(
    () =>
      [...moods]
        .filter((m) => historyDates.includes(m.date))
        .sort((a, b) => b.date.localeCompare(a.date)),
    [historyDates, moods]
  );

  const avg = useMemo(
    () =>
      moods.length === 0
        ? 0
        : moods.reduce((a, m) => a + m.value, 0) / moods.length,
    [moods]
  );

  return (
    <Screen bottomPadding={64}>
      <Animated.View entering={FadeInDown.duration(500)} style={{ gap: 6 }}>
        <Typo variant="eyebrow" color={Colors.accent}>
          Reflection · be honest
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
          How are{' '}
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
            you, truly?
          </Typo>
        </Typo>
        <Typo variant="body" style={{ marginTop: 4 }}>
          One minute to notice. Two breaths. Name it.
        </Typo>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(100).duration(500)}>
        <Card padding={20}>
          <Typo variant="eyebrow" color={Colors.inkMuted}>
            Today&apos;s check-in
          </Typo>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 16,
              marginBottom: 4,
            }}
          >
            {MOODS.map((m) => {
              const active = value === m.value;
              return (
                <Pressable
                  key={m.value}
                  onPress={() => {
                    setValue(m.value);
                    if (Platform.OS === 'ios') {
                      Haptics.selectionAsync().catch(() => {});
                    }
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={m.label}
                  accessibilityState={{ selected: active }}
                  style={({ pressed }) => ({
                    alignItems: 'center',
                    gap: 6,
                    flex: 1,
                    paddingVertical: 8,
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <View
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 26,
                      backgroundColor: active ? m.background : Colors.surfaceMuted,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: active ? 2 : 0,
                      borderColor: m.color,
                    }}
                  >
                    <Ionicons
                      name={m.icon}
                      size={24}
                      color={active ? m.color : Colors.inkMuted}
                    />
                  </View>
                  <Typo
                    variant="label"
                    color={active ? m.color : Colors.inkMuted}
                    style={{ fontSize: 11 }}
                  >
                    {m.label}
                  </Typo>
                </Pressable>
              );
            })}
          </View>

          <View style={{ marginTop: 16, gap: 10 }}>
            <TextField
              placeholder="A note to your future self (optional)…"
              value={note}
              onChangeText={setNote}
              multiline
            />
            <Button
              title={saved ? 'Saved · thank you' : 'Record check-in'}
              icon={saved ? 'checkmark' : 'leaf-outline'}
              onPress={submit}
              disabled={value == null}
              loading={saving}
              fullWidth
            />
            {error ? <Typo variant="caption" color={Colors.error}>{error}</Typo> : null}
          </View>
        </Card>
      </Animated.View>

      {/* Weekly rhythm */}
      <Animated.View entering={FadeInDown.delay(200).duration(500)} style={{ gap: 12 }}>
        <Typo variant="eyebrow" color={Colors.inkMuted}>
          Your rhythm
        </Typo>
        <Typo variant="heading">This week</Typo>
        <Card padding={20}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              height: 130,
            }}
          >
            {week.map((iso) => {
              const entry = moodByDate[iso];
              const value = entry?.value ?? 0;
              const color = MOODS.find((m) => m.value === value)?.color ?? Colors.border;
              const bg = MOODS.find((m) => m.value === value)?.background ?? Colors.border;
              const height = value > 0 ? (value / 5) * 100 + 8 : 4;
              return (
                <View key={iso} style={{ alignItems: 'center', gap: 8, flex: 1 }}>
                  <View
                    style={{
                      width: 22,
                      height: height,
                      borderRadius: 11,
                      backgroundColor: value > 0 ? color : Colors.borderSoft,
                      borderCurve: 'continuous',
                      boxShadow: value > 0 ? `inset 0 -8px 0 ${bg}` : 'none',
                    }}
                  />
                  <Typo variant="label" color={Colors.inkMuted} style={{ fontSize: 10 }}>
                    {dayLetter(iso)}
                  </Typo>
                </View>
              );
            })}
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 16,
              paddingTop: 16,
              borderTopWidth: 1,
              borderTopColor: Colors.borderSoft,
            }}
          >
            <View>
              <Typo variant="caption" color={Colors.inkMuted}>
                Average mood
              </Typo>
              <Typo
                style={{
                  fontFamily: DisplayFont,
                  fontSize: 22,
                  color: Colors.ink,
                  letterSpacing: -0.4,
                }}
              >
                {avg > 0 ? avg.toFixed(1) : '—'}
                <Typo
                  style={{
                    fontFamily: DisplayFont,
                    fontSize: 14,
                    color: Colors.inkMuted,
                  }}
                >
                  {' '}/ 5
                </Typo>
              </Typo>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Typo variant="caption" color={Colors.inkMuted}>
                Entries
              </Typo>
              <Typo
                style={{
                  fontFamily: DisplayFont,
                  fontSize: 22,
                  color: Colors.ink,
                  letterSpacing: -0.4,
                }}
              >
                {moods.length}
              </Typo>
            </View>
          </View>
        </Card>
      </Animated.View>

      {/* Journal entries */}
      <Animated.View entering={FadeInDown.delay(300).duration(500)} style={{ gap: 12 }}>
        <Typo variant="eyebrow" color={Colors.inkMuted}>
          Letters to self
        </Typo>
        <View style={{ gap: 10 }}>
          <Typo variant="heading">Check-in history</Typo>
          <Segmented options={['today', '7', '30'] as const} value={range} onChange={setRange} />
        </View>
        {history.length === 0 ? (
          <Card tone="outlined" padding={24}>
            <Typo variant="body" align="center" color={Colors.inkMuted}>
              Your reflections will gather here.
            </Typo>
          </Card>
        ) : (
          <View style={{ gap: 10 }}>
            {history.map((m, i) => {
              const mood = MOODS.find((mm) => mm.value === m.value);
              return (
                <Animated.View
                  key={m.id}
                  entering={FadeIn.delay(100 * i).duration(400)}
                >
                  <Card padding={16}>
                    <View
                      style={{
                        flexDirection: 'row',
                        gap: 12,
                        alignItems: 'flex-start',
                      }}
                    >
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: Radii.md,
                          backgroundColor: mood?.background ?? Colors.surfaceMuted,
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderCurve: 'continuous',
                        }}
                      >
                        <Ionicons
                          name={mood?.icon ?? 'ellipse-outline'}
                          size={20}
                          color={mood?.color ?? Colors.inkMuted}
                        />
                      </View>
                      <View style={{ flex: 1, gap: 4 }}>
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'baseline',
                          }}
                        >
                          <Typo variant="bodyEmphasis" color={mood?.color}>
                            {mood?.label}
                          </Typo>
                          <Typo variant="label" color={Colors.inkMuted}>
                            {formatShortDate(m.date)}
                          </Typo>
                        </View>
                        {m.note ? (
                          <Typo
                            variant="body"
                            italic
                            color={Colors.inkSoft}
                            selectable
                          >
                            &ldquo;{m.note}&rdquo;
                          </Typo>
                        ) : (
                          <Typo variant="caption" color={Colors.inkFaint}>
                            No note
                          </Typo>
                        )}
                      </View>
                    </View>
                  </Card>
                </Animated.View>
              );
            })}
          </View>
        )}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400).duration(500)}>
        <Card tone="muted" padding={20}>
          <Typo variant="eyebrow" color={Colors.inkMuted}>
            Your compass
          </Typo>
          <Typo
            variant="body"
            italic
            color={Colors.inkSoft}
            style={{ marginTop: 8, fontSize: 16, lineHeight: 24 }}
          >
            &ldquo;
            {preferences.focusStatement ||
              'Take the next small step. That is enough.'}
            &rdquo;
          </Typo>
          <Typo variant="label" color={Colors.inkMuted} style={{ marginTop: 8 }}>
            — {preferences.name || 'you'}, on beginning
          </Typo>
        </Card>
      </Animated.View>
    </Screen>
  );
}

function Segmented<T extends string>({ options, value, onChange }: { options: readonly T[]; value: T; onChange: (value: T) => void }) {
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
