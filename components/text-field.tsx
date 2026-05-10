import { View, TextInput, TextInputProps } from 'react-native';
import { useState } from 'react';
import { Typo } from './typography';
import { Colors, Radii } from '@/constants/Theme';
import { Fonts } from '@/constants/Typography';

interface TextFieldProps extends TextInputProps {
  label?: string;
  helper?: string;
  error?: string;
  multiline?: boolean;
}

export function TextField({
  label,
  helper,
  error,
  style,
  onFocus,
  onBlur,
  multiline,
  ...rest
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const borderColor = error
    ? Colors.error
    : focused
      ? Colors.ink
      : Colors.border;

  return (
    <View style={{ gap: 6 }}>
      {label ? (
        <Typo variant="label" color={Colors.inkSoft}>
          {label}
        </Typo>
      ) : null}
      <View
        style={{
          borderWidth: 1,
          borderColor,
          borderRadius: Radii.md,
          backgroundColor: Colors.surface,
          paddingHorizontal: 14,
          paddingVertical: multiline ? 12 : 0,
          minHeight: multiline ? 112 : 52,
          justifyContent: 'center',
          borderCurve: 'continuous',
        }}
      >
        <TextInput
          {...rest}
          multiline={multiline}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          placeholderTextColor={Colors.inkFaint}
          scrollEnabled={multiline}
          style={[
            {
              fontFamily: Fonts.regular,
              fontSize: 15,
              lineHeight: 22,
              color: Colors.ink,
              paddingVertical: multiline ? 0 : 12,
              paddingTop: 0,
              paddingBottom: 0,
              textAlignVertical: multiline ? 'top' : 'center',
              minHeight: multiline ? 88 : undefined,
            },
            style,
          ]}
        />
      </View>
      {error ? (
        <Typo variant="caption" color={Colors.error}>
          {error}
        </Typo>
      ) : helper ? (
        <Typo variant="caption">{helper}</Typo>
      ) : null}
    </View>
  );
}
