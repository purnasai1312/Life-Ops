import { useEffect, useState } from 'react';
import { View, Pressable, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Screen } from '@/components/screen';
import { Typo } from '@/components/typography';
import { Card } from '@/components/card';
import { Tag } from '@/components/tag';
import { Button } from '@/components/button';
import { EmptyState } from '@/components/empty-state';
import { ProgressBar } from '@/components/progress-bar';
import { Colors, DisplayFont, Radii } from '@/constants/Theme';
import { Fonts } from '@/constants/Typography';
import { useAppStore } from '@/store/useAppStore';
import { accentPair } from '@/utils/colors';
import { GOAL_CATEGORY_META } from '@/utils/goals';
import { daysUntil, formatShortDate } from '@/utils/date';

export default function GoalsScreen() {
  return (
    <Screen>
      <GoalsContent />
    </Screen>
  );
}

export function GoalsContent({ showHeader = true }: { showHeader?: boolean }) {
  const router = useRouter();
  const goals = useAppStore((s) => s.goals);
  const loadGoals = useAppStore((s) => s.loadGoals);
  const incrementGoal = useAppStore((s) => s.incrementGoal);
  const deleteGoal = useAppStore((s) => s.deleteGoal);
  const [busyGoalId, setBusyGoalId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadGoals().catch(() => {});
  }, [loadGoals]);

  const handleDelete = (id: string, title: string) => {
    const run = async () => {
      setBusyGoalId(id);
      setFeedback(null);
      try {
        await deleteGoal(id);
        setFeedback({ type: 'success', message: 'Goal removed.' });
      } catch (error) {
        if (__DEV__) console.warn('Goal delete failed', error);
        setFeedback({ type: 'error', message: 'Could not remove goal. Please try again.' });
      } finally {
        setBusyGoalId(null);
      }
    };

    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm(`Remove "${title}"?`)) {
        run();
      }
      return;
    }
    Alert.alert(`Remove "${title}"?`, undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: run },
    ]);
  };

  const handleIncrement = async (id: string, delta: number) => {
    setBusyGoalId(id);
    setFeedback(null);
    try {
      await incrementGoal(id, delta);
      setFeedback({ type: 'success', message: delta > 0 ? 'Progress logged.' : 'Progress updated.' });
    } catch (error) {
      if (__DEV__) console.warn('Goal progress update failed', error);
      setFeedback({ type: 'error', message: 'Could not update progress. Please try again.' });
    } finally {
      setBusyGoalId(null);
    }
  };

  const totalProgress =
    goals.length === 0
      ? 0
      : goals.reduce((a, g) => a + (g.target > 0 ? g.progress / g.target : 0), 0) /
        goals.length;

  return (
    <>
      {showHeader ? (
      <Animated.View entering={FadeInDown.duration(500)} style={{ gap: 6 }}>
        <Typo variant="eyebrow" color={Colors.accent}>
          Horizons · long arcs
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
          Where you&apos;re{'\n'}
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
            headed.
          </Typo>
        </Typo>
      </Animated.View>
      ) : null}

      {goals.length > 0 ? (
        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <Card tone="raised" padding={22}>
            <View style={{ gap: 14 }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                }}
              >
                <Typo variant="eyebrow" color={Colors.inkMuted}>
                  Combined progress
                </Typo>
                <Typo
                  style={{
                    fontFamily: Fonts.semiBold,
                    fontSize: 28,
                    lineHeight: 34,
                    color: Colors.ink,
                    fontVariant: ['tabular-nums' as const],
                  }}
                >
                  {Math.round(totalProgress * 100)}%
                </Typo>
              </View>
              <ProgressBar progress={totalProgress} color={Colors.ink} height={8} />
              <Typo variant="caption" color={Colors.inkMuted}>
                {goals.length} active {goals.length === 1 ? 'goal' : 'goals'} · keep turning up
              </Typo>
            </View>
          </Card>
        </Animated.View>
      ) : null}

      {feedback ? (
        <Typo variant="caption" color={feedback.type === 'error' ? Colors.error : Colors.forest}>
          {feedback.message}
        </Typo>
      ) : null}

      {goals.length === 0 ? (
        <EmptyState
          icon="telescope-outline"
          title="No goals yet"
          description="Choose a health or consistency goal like protein, workouts, water, sleep, walking, or reflection."
          cta={{
            label: 'Set a goal',
            icon: 'add',
            onPress: () => router.push('/modals/add-goal'),
          }}
        />
      ) : (
        <View style={{ gap: 14 }}>
          {goals.map((g, i) => {
            const pair = accentPair(g.color);
            const pct = g.target > 0 ? g.progress / g.target : 0;
            const days = daysUntil(g.dueDate);
            const meta = GOAL_CATEGORY_META[g.category ?? 'custom'];
            return (
              <Animated.View
                key={g.id}
                entering={FadeInDown.delay(150 + i * 80).duration(500)}
              >
                <Card padding={0}>
                  <View
                    style={{
                      paddingHorizontal: 20,
                      paddingTop: 20,
                      paddingBottom: 16,
                      gap: 14,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: 12,
                      }}
                    >
                      <View
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: 21,
                          borderWidth: 1,
                          borderColor: Colors.border,
                          backgroundColor: Colors.bgElevated,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Ionicons name={meta.icon} size={20} color={Colors.inkSoft} />
                      </View>
                      <View style={{ flex: 1, gap: 6 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <View
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: 3,
                              backgroundColor: pair.base,
                            }}
                          />
                          <Typo
                            variant="eyebrow"
                            color={pair.ink}
                            style={{ fontSize: 10 }}
                          >
                            {meta.label}{g.dueDate ? ` · by ${formatShortDate(g.dueDate)}` : ''}
                          </Typo>
                        </View>
                        <Typo
                          style={{
                            fontFamily: DisplayFont,
                            fontSize: 24,
                            lineHeight: 28,
                            letterSpacing: -0.4,
                            color: Colors.ink,
                          }}
                        >
                          {g.title}
                        </Typo>
                        {g.description ? (
                          <Typo variant="body" style={{ marginTop: 2 }}>
                            {g.description}
                          </Typo>
                        ) : null}
                      </View>
                      <Pressable
                        onPress={() => handleDelete(g.id, g.title)}
                        disabled={busyGoalId === g.id}
                        hitSlop={10}
                        style={({ pressed }) => ({
                          padding: 6,
                          opacity: busyGoalId === g.id ? 0.4 : pressed ? 0.5 : 1,
                        })}
                        accessibilityLabel={`Remove ${g.title}`}
                      >
                        <Ionicons name="close" size={18} color={Colors.inkFaint} />
                      </Pressable>
                    </View>

                    <View style={{ gap: 8 }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'baseline',
                        }}
                      >
                        <Typo
                          variant="bodyEmphasis"
                          style={{
                            fontFamily: DisplayFont,
                            fontSize: 20,
                            color: pair.ink,
                          }}
                        >
                          {g.progress}
                          <Typo
                            style={{
                              fontFamily: DisplayFont,
                              fontSize: 14,
                              color: Colors.inkMuted,
                            }}
                          >
                            {' / '}
                            {g.target}
                            {' '}
                            {g.unit}
                          </Typo>
                        </Typo>
                        <Typo
                          variant="label"
                          color={Colors.inkSoft}
                          style={{
                            fontFamily: Fonts.semiBold,
                            fontSize: 16,
                            lineHeight: 22,
                            fontVariant: ['tabular-nums' as const],
                          }}
                        >
                          {Math.round(pct * 100)}%
                        </Typo>
                      </View>
                      <ProgressBar progress={pct} color={pair.base} height={7} />
                    </View>

                    {days !== null ? (
                      <View style={{ flexDirection: 'row', gap: 6 }}>
                        <Tag
                          label={
                            days < 0
                              ? `${Math.abs(days)} days past`
                              : days === 0
                                ? 'Due today'
                                : `${days} days to go`
                          }
                          background={days < 0 ? Colors.accentSoft : Colors.surfaceMuted}
                          color={days < 0 ? Colors.accentInk : Colors.inkSoft}
                        />
                      </View>
                    ) : null}
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      borderTopWidth: 1,
                      borderTopColor: Colors.borderSoft,
                    }}
                  >
                    <StepButton
                      icon="remove"
                      disabled={g.progress === 0 || busyGoalId === g.id}
                      onPress={() => handleIncrement(g.id, -1)}
                      side="left"
                    />
                    <View style={{ width: 1, backgroundColor: Colors.borderSoft }} />
                    <StepButton
                      icon="add"
                      label="Log progress"
                      disabled={busyGoalId === g.id}
                      onPress={() => handleIncrement(g.id, 1)}
                      color={pair.ink}
                      background={pair.soft}
                      side="right"
                    />
                  </View>
                </Card>
              </Animated.View>
            );
          })}
          <View style={{ alignItems: 'center', marginTop: 8 }}>
            <Button
              title="New goal"
              icon="add"
              variant="secondary"
              onPress={() => router.push('/modals/add-goal')}
            />
          </View>
        </View>
      )}
    </>
  );
}

function StepButton({
  icon,
  label,
  onPress,
  disabled,
  color = Colors.inkSoft,
  background = 'transparent',
  side,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label?: string;
  onPress: () => void;
  disabled?: boolean;
  color?: string;
  background?: string;
  side: 'left' | 'right';
}) {
  const flex = label ? 2 : 1;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label || (icon === 'add' ? 'Increment' : 'Decrement')}
      style={({ pressed }) => ({
        flex,
        minHeight: 48,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: background,
        opacity: disabled ? 0.4 : pressed ? 0.7 : 1,
        borderBottomLeftRadius: side === 'left' ? Radii.xl : 0,
        borderBottomRightRadius: side === 'right' ? Radii.xl : 0,
      })}
    >
      <Ionicons name={icon} size={16} color={color} />
      {label ? <Typo variant="bodyEmphasis" color={color}>{label}</Typo> : null}
    </Pressable>
  );
}
