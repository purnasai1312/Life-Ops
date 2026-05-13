import { useEffect, useReducer } from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radii } from '@/constants/Theme';
import { createTimerState, formatTimer, timerReducer } from '@/utils/timer';
import { Typo } from './typography';

type Props = {
  seconds: number;
};

export function StepTimer({ seconds }: Props) {
  const [state, dispatch] = useReducer(timerReducer, seconds, createTimerState);

  useEffect(() => {
    if (!state.isRunning) return undefined;
    const id = setInterval(() => dispatch({ type: 'tick' }), 1000);
    return () => clearInterval(id);
  }, [state.isRunning]);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <Typo variant="label" color={Colors.inkMuted} style={{ fontVariant: ['tabular-nums'] }}>
        {formatTimer(state.remainingSeconds)}
      </Typo>
      <TimerButton
        icon={state.isRunning ? 'pause' : 'play'}
        label={state.isRunning ? 'Pause timer' : 'Start timer'}
        onPress={() => dispatch({ type: state.isRunning ? 'pause' : 'start' })}
      />
      <TimerButton icon="refresh" label="Reset timer" onPress={() => dispatch({ type: 'reset' })} />
    </View>
  );
}

function TimerButton({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => ({
        width: 30,
        height: 30,
        borderRadius: Radii.pill,
        borderWidth: 1,
        borderColor: Colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.bgElevated,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Ionicons name={icon} size={14} color={Colors.inkSoft} />
    </Pressable>
  );
}
