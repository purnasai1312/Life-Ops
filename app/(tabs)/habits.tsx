import { View, Pressable, Alert, Platform } from 'react-native';
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

export default function HabitsScreen() {
  const router = useRouter();
  const habits = useAppStore((s) => s.habits);
  const toggleHabitToday = useAppStore((s) => s.toggleHabitToday);
  const deleteHabit = useAppStore((s) => s.deleteHabit);

  const today = getTodayISO();
  const week = lastNDates(7);

  const handleDelete = (id: string, title: string) => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm(`Remove "${title}"?`)) {
        deleteHabit(id);
      }
      return;
    }
    Alert.alert(`Remove "${title}"?`, 'This will end the ritual.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => deleteHabit(id) },
    ]);
  };

  const totalStreak = habits.reduce((a, h) => a + h.streak, 0);
  const completedToday = habits.filter((h) => h.completions[today]).length;

  return (
    <Screen>
      <Animated.View entering={FadeInDown.duration(500)} style={{ gap: 6 }}>
        <Typo variant="eyebrow" color={Colors.accent}>
          Rituals · the quiet work
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
          Small motions, repeated. The shape of who you&apos;re becoming.
        </Typo>
      </Animated.View>

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
                    onPress={() => toggleHabitToday(h.id)}
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
    </Screen>
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
