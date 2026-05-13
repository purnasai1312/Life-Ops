import { View, Pressable, Alert, Platform } from 'react-native';
import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Screen } from '@/components/screen';
import { Typo } from '@/components/typography';
import { Card } from '@/components/card';
import { Tag } from '@/components/tag';
import { Button } from '@/components/button';
import { IconBadge } from '@/components/icon-badge';
import { EmptyState } from '@/components/empty-state';
import { Colors, DisplayFont, Radii } from '@/constants/Theme';
import { Fonts } from '@/constants/Typography';
import { useAppStore, getTodayISO } from '@/store/useAppStore';
import { accentPair } from '@/utils/colors';
import { lastNDates, dayLetter } from '@/utils/date';
import { GoalsContent } from './goals';

export default function HabitsScreen() {
  const router = useRouter();
  const habits = useAppStore((s) => s.habits);
  const toggleHabitToday = useAppStore((s) => s.toggleHabitToday);
  const deleteHabit = useAppStore((s) => s.deleteHabit);
  const [section, setSection] = useState<'habits' | 'goals'>('habits');
  const [range, setRange] = useState<'today' | '7' | '30'>('7');

  const today = getTodayISO();
  const week = lastNDates(7);
  const historyDates = useMemo(
    () => (range === 'today' ? [today] : lastNDates(range === '7' ? 7 : 30)),
    [range, today]
  );
  const habitHistory = useMemo(
    () =>
      historyDates
        .map((date) => {
          const completed = habits.filter((habit) => habit.completions[date]).length;
          const total = habits.length;
          return {
            date,
            completed,
            total,
            percent: total > 0 ? Math.round((completed / total) * 100) : 0,
          };
        })
        .reverse(),
    [habits, historyDates]
  );

  const handleDelete = (id: string, title: string) => {
    const removeHabit = () => {
      deleteHabit(id).catch((error) => {
        if (__DEV__) console.warn('Failed to delete habit', error);
        Alert.alert('Could not remove habit', 'Please try again in a moment.');
      });
    };

    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm(`Remove "${title}"?`)) {
        removeHabit();
      }
      return;
    }
    Alert.alert(`Remove "${title}"?`, 'This will end the ritual.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: removeHabit },
    ]);
  };

  const handleToggleHabit = (id: string) => {
    toggleHabitToday(id).catch((error) => {
      if (__DEV__) console.warn('Failed to update habit', error);
      Alert.alert('Could not update habit', 'Please try again in a moment.');
    });
  };

  const totalStreak = habits.reduce((a, h) => a + h.streak, 0);
  const completedToday = habits.filter((h) => h.completions[today]).length;

  return (
    <Screen>
      <Animated.View entering={FadeInDown.duration(500)} style={{ gap: 6 }}>
        <Typo variant="eyebrow" color={Colors.accent}>
          Rituals · goals
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
          Habits,{' '}
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
            tended.
          </Typo>
        </Typo>
        <Typo variant="body" style={{ marginTop: 4 }}>
          Small motions and long arcs, kept in one calm place.
        </Typo>
      </Animated.View>

      <Segmented options={['habits', 'goals'] as const} value={section} onChange={setSection} />

      {section === 'goals' ? (
        <GoalsContent showHeader={false} />
      ) : (
      <>
      {habits.length > 0 ? (
        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <Card tone="muted" padding={18}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              <StatBlock
                value={`${completedToday}/${habits.length}`}
                label="today"
              />
              <Divider />
              <StatBlock
                value={`${totalStreak}`}
                label={`streak day${totalStreak === 1 ? '' : 's'}`}
              />
              <Divider />
              <StatBlock
                value={`${habits.length}`}
                label={`ritual${habits.length === 1 ? '' : 's'}`}
              />
            </View>
          </Card>
        </Animated.View>
      ) : null}

      {habits.length === 0 ? (
        <EmptyState
          icon="leaf-outline"
          title="No rituals yet"
          description="Choose one small habit to tend daily. It becomes a foothold for everything else."
          cta={{
            label: 'Add your first habit',
            icon: 'add',
            onPress: () => router.push('/modals/add-habit'),
          }}
        />
      ) : (
        <View style={{ gap: 12 }}>
          <Card padding={18}>
            <View style={{ gap: 12 }}>
              <Typo variant="eyebrow" color={Colors.inkMuted}>
                Habit history
              </Typo>
              <Segmented options={['today', '7', '30'] as const} value={range} onChange={setRange} />
              {habitHistory.map((day) => (
                <View key={day.date} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typo variant="caption" color={Colors.inkMuted}>
                    {day.date === today ? 'Today' : day.date}
                  </Typo>
                  <Typo variant="bodyEmphasis">
                    {day.completed}/{day.total} · {day.percent}%
                  </Typo>
                </View>
              ))}
            </View>
          </Card>
          {habits.map((h, i) => {
            const pair = accentPair(h.color);
            const doneToday = !!h.completions[today];
            return (
              <Animated.View
                key={h.id}
                entering={FadeInDown.delay(150 + i * 60).duration(500)}
              >
                <Card padding={0}>
                  <View style={{ padding: 18, gap: 14 }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 14,
                      }}
                    >
                      <IconBadge
                        name={h.icon as keyof typeof Ionicons.glyphMap}
                        color={pair.ink}
                        background={pair.soft}
                        size={48}
                      />
                      <View style={{ flex: 1, gap: 4 }}>
                        <Typo variant="subheading">{h.title}</Typo>
                        <View
                          style={{
                            flexDirection: 'row',
                            gap: 6,
                            alignItems: 'center',
                          }}
                        >
                          <Tag
                            label={h.cadence}
                            background={Colors.surfaceMuted}
                            color={Colors.inkSoft}
                          />
                          {h.streak > 0 ? (
                            <Tag
                              label={`${h.streak}-day streak`}
                              background={pair.soft}
                              color={pair.ink}
                              dotColor={pair.base}
                            />
                          ) : null}
                        </View>
                      </View>
                      <Pressable
                        onPress={() => handleDelete(h.id, h.title)}
                        hitSlop={10}
                        style={({ pressed }) => ({
                          padding: 8,
                          opacity: pressed ? 0.5 : 1,
                        })}
                        accessibilityLabel={`Remove ${h.title}`}
                      >
                        <Ionicons
                          name="close"
                          size={18}
                          color={Colors.inkFaint}
                        />
                      </Pressable>
                    </View>

                    {/* Week dots */}
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        paddingHorizontal: 4,
                      }}
                    >
                      {week.map((iso) => {
                        const done = !!h.completions[iso];
                        const isToday = iso === today;
                        return (
                          <View
                            key={iso}
                            style={{ alignItems: 'center', gap: 6 }}
                          >
                            <Typo
                              variant="label"
                              color={
                                isToday ? Colors.ink : Colors.inkFaint
                              }
                              style={{ fontSize: 10 }}
                            >
                              {dayLetter(iso)}
                            </Typo>
                            <View
                              style={{
                                width: 24,
                                height: 24,
                                borderRadius: 6,
                                backgroundColor: done
                                  ? pair.base
                                  : Colors.surfaceMuted,
                                borderWidth: isToday && !done ? 1.5 : 0,
                                borderColor: Colors.ink,
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderCurve: 'continuous',
                              }}
                            >
                              {done ? (
                                <Ionicons
                                  name="checkmark"
                                  size={14}
                                  color="#FBF8F0"
                                />
                              ) : null}
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                  <Pressable
                    onPress={() => handleToggleHabit(h.id)}
                    accessibilityRole="button"
                    accessibilityLabel={
                      doneToday
                        ? `Mark ${h.title} incomplete`
                        : `Complete ${h.title}`
                    }
                    style={({ pressed }) => ({
                      paddingVertical: 14,
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'row',
                      gap: 8,
                      borderTopWidth: 1,
                      borderTopColor: Colors.borderSoft,
                      backgroundColor: doneToday
                        ? pair.soft
                        : 'transparent',
                      borderBottomLeftRadius: Radii.xl,
                      borderBottomRightRadius: Radii.xl,
                      opacity: pressed ? 0.8 : 1,
                    })}
                  >
                    <Ionicons
                      name={doneToday ? 'checkmark-circle' : 'ellipse-outline'}
                      size={18}
                      color={doneToday ? pair.ink : Colors.inkMuted}
                    />
                    <Typo
                      variant="bodyEmphasis"
                      color={doneToday ? pair.ink : Colors.inkSoft}
                    >
                      {doneToday ? 'Completed today' : 'Mark complete'}
                    </Typo>
                  </Pressable>
                </Card>
              </Animated.View>
            );
          })}
          <View style={{ alignItems: 'center', marginTop: 8 }}>
            <Button
              title="New habit"
              icon="add"
              variant="secondary"
              onPress={() => router.push('/modals/add-habit')}
            />
          </View>
        </View>
      )}
      </>
      )}
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

function StatBlock({ value, label }: { value: string; label: string }) {
  return (
    <View style={{ gap: 2, alignItems: 'center', flex: 1 }}>
      <Typo
        style={{
          fontFamily: Fonts.semiBold,
          fontSize: 28,
          lineHeight: 34,
          color: Colors.ink,
          fontVariant: ['tabular-nums' as const],
        }}
      >
        {value}
      </Typo>
      <Typo variant="label" color={Colors.inkMuted} style={{ fontSize: 11 }}>
        {label}
      </Typo>
    </View>
  );
}

function Divider() {
  return (
    <View
      style={{
        width: 1,
        backgroundColor: Colors.border,
        marginHorizontal: 4,
      }}
    />
  );
}
