import { Text, TextProps, StyleSheet } from 'react-native';
import { Colors, DisplayFont } from '@/constants/Theme';
import { Fonts } from '@/constants/Typography';

type Variant =
  | 'display'
  | 'title'
  | 'heading'
  | 'subheading'
  | 'body'
  | 'bodyEmphasis'
  | 'caption'
  | 'label'
  | 'eyebrow';

interface TypoProps extends TextProps {
  variant?: Variant;
  color?: string;
  align?: 'left' | 'center' | 'right';
  italic?: boolean;
}

const styles = {
  display: {
    fontFamily: DisplayFont,
    fontSize: 44,
    lineHeight: 48,
    letterSpacing: -1,
    color: Colors.ink,
    fontWeight: '400' as const,
  },
  title: {
    fontFamily: DisplayFont,
    fontSize: 32,
    lineHeight: 36,
    letterSpacing: -0.6,
    color: Colors.ink,
    fontWeight: '400' as const,
  },
  heading: {
    fontFamily: DisplayFont,
    fontSize: 22,
    lineHeight: 26,
    letterSpacing: -0.2,
    color: Colors.ink,
    fontWeight: '400' as const,
  },
  subheading: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    lineHeight: 22,
    color: Colors.ink,
  },
  body: {
    fontFamily: Fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    color: Colors.inkSoft,
  },
  bodyEmphasis: {
    fontFamily: Fonts.medium,
    fontSize: 15,
    lineHeight: 22,
    color: Colors.ink,
  },
  caption: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: Colors.inkMuted,
  },
  label: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: Colors.inkSoft,
  },
  eyebrow: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
    color: Colors.inkMuted,
  },
} satisfies Record<Variant, object>;

export function Typo({
  variant = 'body',
  color,
  align,
  italic,
  style,
  ...rest
}: TypoProps) {
  return (
    <Text
      {...rest}
      style={StyleSheet.flatten([
        styles[variant],
        align ? { textAlign: align } : null,
        italic ? { fontStyle: 'italic' } : null,
        color ? { color } : null,
        style,
      ])}
    />
  );
}
