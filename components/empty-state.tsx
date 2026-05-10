import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typo } from './typography';
import { Button } from './button';
import { Colors, Radii } from '@/constants/Theme';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  cta?: { label: string; onPress: () => void; icon?: keyof typeof Ionicons.glyphMap };
}

export function EmptyState({ icon, title, description, cta }: EmptyStateProps) {
  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
        paddingHorizontal: 32,
        gap: 14,
      }}
    >
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: Radii['2xl'],
          backgroundColor: Colors.surfaceMuted,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: Colors.borderSoft,
          borderCurve: 'continuous',
        }}
      >
        <Ionicons name={icon} size={32} color={Colors.inkMuted} />
      </View>
      <Typo variant="heading" align="center">
        {title}
      </Typo>
      <Typo variant="body" align="center" style={{ maxWidth: 320 }}>
        {description}
      </Typo>
      {cta ? (
        <View style={{ marginTop: 8 }}>
          <Button title={cta.label} icon={cta.icon} onPress={cta.onPress} />
        </View>
      ) : null}
    </View>
  );
}
