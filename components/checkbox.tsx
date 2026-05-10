import { Pressable, View, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Theme';

interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  size?: number;
  color?: string;
}

export function Checkbox({
  checked,
  onChange,
  size = 26,
  color = Colors.forest,
}: CheckboxProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      hitSlop={8}
      onPress={() => {
        if (Platform.OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        }
        onChange();
      }}
      style={({ pressed }) => ({
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 1.5,
        borderColor: checked ? color : Colors.divider,
        backgroundColor: checked ? color : 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.7 : 1,
      })}
    >
      {checked ? (
        <Ionicons name="checkmark" size={size * 0.6} color="#FBF8F0" />
      ) : (
        <View />
      )}
    </Pressable>
  );
}
