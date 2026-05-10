import { View, ViewProps } from 'react-native';
import { Colors, Radii } from '@/constants/Theme';
import { Typo } from './typography';

interface TagProps extends ViewProps {
  label: string;
  color?: string;
  background?: string;
  dotColor?: string;
}

export function Tag({
  label,
  color = Colors.ink,
  background = Colors.surfaceMuted,
  dotColor,
  style,
  ...rest
}: TagProps) {
  return (
    <View
      {...rest}
      style={[
        {
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: Radii.pill,
          backgroundColor: background,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          alignSelf: 'flex-start',
          borderCurve: 'continuous' as const,
        },
        style,
      ]}
    >
      {dotColor ? (
        <View
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: dotColor,
          }}
        />
      ) : null}
      <Typo variant="label" color={color} style={{ fontSize: 11, letterSpacing: 0.6 }}>
        {label}
      </Typo>
    </View>
  );
}
