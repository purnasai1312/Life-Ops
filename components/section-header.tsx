import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typo } from './typography';
import { Colors } from '@/constants/Theme';

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  action?: { label: string; onPress: () => void; icon?: keyof typeof Ionicons.glyphMap };
}

export function SectionHeader({ eyebrow, title, action }: SectionHeaderProps) {
  return (
    <View style={{ gap: 4, marginBottom: 12 }}>
      {eyebrow ? (
        <Typo variant="eyebrow" color={Colors.inkMuted}>
          {eyebrow}
        </Typo>
      ) : null}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typo variant="heading">{title}</Typo>
        {action ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={action.label}
            onPress={action.onPress}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              paddingHorizontal: 8,
              paddingVertical: 6,
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <Typo variant="bodyEmphasis" color={Colors.accent}>
              {action.label}
            </Typo>
            {action.icon ? (
              <Ionicons name={action.icon} size={14} color={Colors.accent} />
            ) : null}
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
