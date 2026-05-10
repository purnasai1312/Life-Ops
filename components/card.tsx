import { View, ViewProps } from 'react-native';
import { Colors, Radii, Shadows } from '@/constants/Theme';

interface CardProps extends ViewProps {
  tone?: 'default' | 'muted' | 'raised' | 'outlined';
  padding?: number;
  radius?: keyof typeof Radii;
}

export function Card({
  tone = 'default',
  padding = 20,
  radius = 'xl',
  style,
  children,
  ...rest
}: CardProps) {
  const toneStyles = {
    default: {
      backgroundColor: Colors.surface,
      borderColor: Colors.borderSoft,
      borderWidth: 1,
      boxShadow: Shadows.card,
    },
    muted: {
      backgroundColor: Colors.surfaceMuted,
      borderColor: Colors.border,
      borderWidth: 1,
      boxShadow: 'none',
    },
    raised: {
      backgroundColor: Colors.surface,
      borderColor: 'transparent',
      borderWidth: 0,
      boxShadow: Shadows.lifted,
    },
    outlined: {
      backgroundColor: 'transparent',
      borderColor: Colors.border,
      borderWidth: 1,
      boxShadow: 'none',
    },
  }[tone];

  return (
    <View
      {...rest}
      style={[
        {
          borderRadius: Radii[radius],
          padding,
          borderCurve: 'continuous' as const,
          ...toneStyles,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
