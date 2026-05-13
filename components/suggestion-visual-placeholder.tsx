import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Theme';
import { Typo } from './typography';

type Props = {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
};

export function SuggestionVisualPlaceholder({ label, icon = 'sparkles-outline' }: Props) {
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: Colors.border,
        backgroundColor: Colors.surfaceMuted,
        borderRadius: 18,
        padding: 16,
        gap: 10,
        alignItems: 'center',
      }}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          borderWidth: 1,
          borderColor: Colors.border,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: Colors.bgElevated,
        }}
      >
        <Ionicons name={icon} size={22} color={Colors.inkSoft} />
      </View>
      <Typo variant="caption" color={Colors.inkMuted} style={{ textAlign: 'center' }}>
        {label}
      </Typo>
    </View>
  );
}
