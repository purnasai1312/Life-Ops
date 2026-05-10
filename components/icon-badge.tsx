import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Radii } from '@/constants/Theme';

interface IconBadgeProps {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  background: string;
  size?: number;
}

export function IconBadge({ name, color, background, size = 44 }: IconBadgeProps) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: Radii.lg,
        backgroundColor: background,
        alignItems: 'center',
        justifyContent: 'center',
        borderCurve: 'continuous',
      }}
    >
      <Ionicons name={name} size={size * 0.5} color={color} />
    </View>
  );
}
