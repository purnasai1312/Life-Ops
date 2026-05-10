import {
  Pressable,
  PressableProps,
  View,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Radii } from '@/constants/Theme';
import { Typo } from './typography';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<PressableProps, 'children'> {
  title: string;
  variant?: Variant;
  size?: Size;
  icon?: keyof typeof Ionicons.glyphMap;
  iconRight?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading,
  fullWidth,
  onPress,
  disabled,
  ...rest
}: ButtonProps) {
  const heights = { sm: 40, md: 48, lg: 56 } as const;
  const paddings = { sm: 16, md: 20, lg: 24 } as const;
  const fontSizes = { sm: 14, md: 15, lg: 16 } as const;

  const palette = getPalette(variant, !!disabled);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      disabled={disabled || loading}
      onPress={(e) => {
        if (Platform.OS === 'ios') {
          Haptics.selectionAsync().catch(() => {});
        }
        onPress?.(e);
      }}
      style={({ pressed }) => [
        {
          height: heights[size],
          minWidth: 44,
          paddingHorizontal: paddings[size],
          borderRadius: Radii.pill,
          backgroundColor: palette.bg,
          borderWidth: palette.borderWidth,
          borderColor: palette.border,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          opacity: pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
          boxShadow: palette.shadow,
        },
        disabled || loading ? { transform: [{ scale: 1 }] } : null,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={palette.fg} />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {icon ? <Ionicons name={icon} size={16} color={palette.fg} /> : null}
          <Typo
            variant="bodyEmphasis"
            color={palette.fg}
            style={{ fontSize: fontSizes[size], letterSpacing: 0.2 }}
          >
            {title}
          </Typo>
          {iconRight ? (
            <Ionicons name={iconRight} size={16} color={palette.fg} />
          ) : null}
        </View>
      )}
    </Pressable>
  );
}

function getPalette(variant: Variant, disabled: boolean) {
  if (disabled) {
    return {
      bg: Colors.surfaceMuted,
      fg: Colors.inkFaint,
      border: 'transparent',
      borderWidth: 0,
      shadow: 'none',
    };
  }
  switch (variant) {
    case 'secondary':
      return {
        bg: Colors.surface,
        fg: Colors.ink,
        border: Colors.border,
        borderWidth: 1,
        shadow: '0 1px 2px rgba(20,19,17,0.04)',
      };
    case 'ghost':
      return {
        bg: 'transparent',
        fg: Colors.ink,
        border: 'transparent',
        borderWidth: 0,
        shadow: 'none',
      };
    case 'destructive':
      return {
        bg: Colors.error,
        fg: '#FFF8EF',
        border: 'transparent',
        borderWidth: 0,
        shadow: '0 6px 18px rgba(184,63,43,0.25)',
      };
    case 'primary':
    default:
      return {
        bg: Colors.ink,
        fg: '#FBF8F0',
        border: 'transparent',
        borderWidth: 0,
        shadow: '0 6px 18px rgba(20,19,17,0.18)',
      };
  }
}
